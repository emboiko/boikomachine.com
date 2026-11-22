import { Resend } from 'resend'
import mongoose from 'mongoose'
import { BUSINESS } from '@/lib/constants'
import {
  getCustomerEmailLogoAttachment,
  wrapCustomerBillingEmail,
} from '@/lib/billing/emailLayout'
import { connectToDatabase } from '@/lib/db/mongoose'
import { ShopInquiry } from '@/lib/models/ShopInquiry'
import { ShopAssistantTranscript } from '@/lib/models/ShopAssistantTranscript'
import { generateInquiryCode } from '@/lib/shopAssistant/inquiryCode'
import {
  formatFileSize,
  getShopInquiryAttachmentDownloadUrl,
} from '@/lib/storage/blob'
import {
  SHOP_INQUIRY_STATUS_ACTIONS,
} from '@/lib/shopAssistant/statuses'

const createServiceError = (message, status = 400) => {
  const error = new Error(message)
  error.status = status
  return error
}

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    return null
  }

  return new Resend(apiKey)
}

const serializeNote = (note) => {
  return {
    id: note._id.toString(),
    text: note.text,
    author: note.author || '',
    createdAt: note.createdAt,
  }
}

const serializeAssessment = (assessment) => {
  if (!assessment) {
    return null
  }

  return {
    recommendation: assessment.recommendation,
    reasons: assessment.reasons || [],
    missingInformation: assessment.missingInformation || [],
    recordedAt: assessment.recordedAt,
  }
}

export const serializeShopInquiry = (inquiry) => {
  let workOrderId = ''

  if (inquiry.workOrderId) {
    workOrderId = inquiry.workOrderId.toString()
  }

  return {
    id: inquiry._id.toString(),
    referenceCode: inquiry.referenceCode,
    customerName: inquiry.customerName,
    customerEmail: inquiry.customerEmail,
    customerPhone: inquiry.customerPhone || '',
    customerAddress: inquiry.customerAddress || '',
    summary: inquiry.summary,
    status: inquiry.status,
    privateNotes: (inquiry.privateNotes || []).map(serializeNote),
    assistantAssessment: serializeAssessment(inquiry.assistantAssessment),
    workOrderId,
    attachments: (inquiry.attachments || []).map((attachment) => {
      return {
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        storageKey: attachment.storageKey,
        downloadUrl: getShopInquiryAttachmentDownloadUrl(
          attachment.storageKey,
          attachment.originalName,
        ),
      }
    }),
    createdAt: inquiry.createdAt,
  }
}

const serializeInquirySummary = (inquiry) => {
  const serialized = serializeShopInquiry(inquiry)

  return {
    id: serialized.id,
    referenceCode: serialized.referenceCode,
    customerName: serialized.customerName,
    customerEmail: serialized.customerEmail,
    summary: serialized.summary,
    status: serialized.status,
    workOrderId: serialized.workOrderId,
    createdAt: serialized.createdAt,
  }
}

const loadInquiry = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null
  }

  return ShopInquiry.findById(id)
}

const createUniqueInquiryCode = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referenceCode = generateInquiryCode()
    const existing = await ShopInquiry.exists({ referenceCode })

    if (!existing) {
      return referenceCode
    }
  }

  throw createServiceError('Could not create an inquiry reference code.', 500)
}

const sendShopInquiryNotification = async (inquiry) => {
  const resend = getResendClient()

  if (!resend) {
    return { sent: false, reason: 'RESEND_API_KEY not configured' }
  }

  const phone = inquiry.customerPhone || 'not provided'
  const address = inquiry.customerAddress || 'not provided'
  const attachmentLines = (inquiry.attachments || []).map((attachment, index) => {
    const downloadUrl = getShopInquiryAttachmentDownloadUrl(
      attachment.storageKey,
      attachment.originalName,
    )

    return `${index + 1}. ${attachment.originalName} (${formatFileSize(attachment.sizeBytes)})\n   ${downloadUrl}`
  })
  const attachmentSection =
    attachmentLines.length > 0
      ? ['', 'Attachments:', attachmentLines.join('\n')].join('\n')
      : '\n\nAttachments: none'

  await resend.emails.send({
    from: `${BUSINESS.name} <${BUSINESS.shopEmail}>`,
    to: BUSINESS.shopEmail,
    replyTo: inquiry.customerEmail,
    subject: `New shop inquiry ${inquiry.referenceCode} - ${inquiry.customerName}`,
    text: [
      `New shop assistant inquiry for ${BUSINESS.name}`,
      '',
      `Reference: ${inquiry.referenceCode}`,
      `Name: ${inquiry.customerName}`,
      `Email: ${inquiry.customerEmail}`,
      `Phone: ${phone}`,
      `Address: ${address}`,
      '',
      'Request:',
      inquiry.summary,
      attachmentSection,
    ].join('\n'),
  })

  return { sent: true }
}

export const createShopInquiryFromAssistant = async ({
  transcriptId,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  summary,
}) => {
  await connectToDatabase()
  const transcript = await ShopAssistantTranscript.findById(transcriptId)

  if (!transcript || transcript.audience !== 'public') {
    throw createServiceError('This chat cannot submit a request.', 403)
  }

  if (transcript.inquiryId) {
    const existingInquiry = await ShopInquiry.findById(transcript.inquiryId)

    if (existingInquiry) {
      return {
        alreadySubmitted: true,
        emailSent: false,
        inquiry: serializeShopInquiry(existingInquiry),
      }
    }
  }

  const referenceCode = await createUniqueInquiryCode()
  const inquiry = await ShopInquiry.create({
    referenceCode,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: (customerPhone || '').trim(),
    customerAddress: (customerAddress || '').trim(),
    summary: summary.trim(),
    attachments: (transcript.attachments || []).map((attachment) => {
      return {
        originalName: attachment.originalName,
        storageKey: attachment.storageKey,
        blobUrl: attachment.blobUrl,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
      }
    }),
    status: 'new',
  })

  transcript.inquiryId = inquiry._id
  await transcript.save()

  let emailSent = false

  try {
    const emailResult = await sendShopInquiryNotification(inquiry)
    emailSent = emailResult.sent
  } catch {
    emailSent = false
  }

  return {
    alreadySubmitted: false,
    emailSent,
    inquiry: serializeShopInquiry(inquiry),
  }
}

export const listShopInquiries = async () => {
  await connectToDatabase()
  const inquiries = await ShopInquiry.find().sort({ createdAt: -1 }).limit(100)

  return inquiries.map(serializeInquirySummary)
}

export const listOpenShopInquiries = async () => {
  await connectToDatabase()
  const inquiries = await ShopInquiry.find({
    $or: [
      { status: { $in: ['new', 'reviewing', 'needs_info'] } },
      { status: 'accepted', workOrderId: null },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(20)

  return inquiries.map(serializeInquirySummary)
}

export const getShopInquiry = async (id) => {
  await connectToDatabase()
  const inquiry = await loadInquiry(id)

  if (!inquiry) {
    throw createServiceError('Inquiry not found.', 404)
  }

  return serializeShopInquiry(inquiry)
}

const customerFirstName = (customerName) => {
  const trimmedName = String(customerName || '').trim()

  if (!trimmedName) {
    return 'there'
  }

  return trimmedName.split(/\s+/)[0]
}

export const buildDefaultInquiryDeclineMessage = (inquiry) => {
  const firstName = customerFirstName(inquiry.customerName)

  return [
    `Hello ${firstName},`,
    `Thank you for contacting ${BUSINESS.name}. We looked over your request (${inquiry.referenceCode}) and we're sorry we aren't able to take this work on.`,
    `That isn't a reflection on you or the project. It just isn't a fit for the shop.`,
    `You're welcome to get in touch if a different job comes up.`,
  ].join('\n\n')
}

const sendInquiryDeclineEmail = async (inquiry, bodyText) => {
  const resend = getResendClient()

  if (!resend) {
    return { sent: false, reason: 'RESEND_API_KEY not configured' }
  }

  if (!inquiry.customerEmail) {
    return { sent: false, reason: 'Customer email is missing' }
  }

  const wrapped = wrapCustomerBillingEmail(bodyText)
  const logoAttachment = await getCustomerEmailLogoAttachment()
  const message = {
    from: `${BUSINESS.name} <${BUSINESS.shopEmail}>`,
    to: inquiry.customerEmail,
    subject: `We aren't able to take this on (${inquiry.referenceCode})`,
    text: wrapped.text,
    html: wrapped.html,
    attachments: [logoAttachment],
  }

  if (inquiry.customerEmail.toLowerCase() !== BUSINESS.shopEmail.toLowerCase()) {
    message.bcc = BUSINESS.shopEmail
  }

  await resend.emails.send(message)

  return { sent: true }
}

export const declineShopInquiry = async (id, message) => {
  await connectToDatabase()
  const inquiry = await loadInquiry(id)

  if (!inquiry) {
    throw createServiceError('Inquiry not found.', 404)
  }

  const trimmedMessage = String(message || '').trim()
  let bodyText = buildDefaultInquiryDeclineMessage(inquiry)

  if (trimmedMessage) {
    bodyText = trimmedMessage
  }

  if (bodyText.length > 5000) {
    throw createServiceError('Keep the decline message under 5000 characters.')
  }

  inquiry.status = 'declined'
  inquiry.customerDeclineMessage = bodyText
  await inquiry.save()

  let emailSent = false
  let emailReason = ''

  try {
    const emailResult = await sendInquiryDeclineEmail(inquiry, bodyText)
    emailSent = emailResult.sent

    if (!emailSent && emailResult.reason) {
      emailReason = emailResult.reason
    }
  } catch (error) {
    emailReason = error.message || 'The decline email could not be sent.'
  }

  return {
    inquiry: serializeShopInquiry(inquiry),
    emailSent,
    emailReason,
  }
}

export const updateShopInquiryStatus = async (id, status) => {
  if (!SHOP_INQUIRY_STATUS_ACTIONS.includes(status)) {
    throw createServiceError('That status is not available from the inquiry page.')
  }

  await connectToDatabase()
  const inquiry = await loadInquiry(id)

  if (!inquiry) {
    throw createServiceError('Inquiry not found.', 404)
  }

  inquiry.status = status
  await inquiry.save()

  return serializeShopInquiry(inquiry)
}

export const addShopInquiryNote = async (id, text, author) => {
  const noteText = text.trim()

  if (author !== 'owner' && author !== 'assistant') {
    throw createServiceError('A note needs an author.')
  }

  if (!noteText) {
    throw createServiceError('Write a note before saving it.')
  }

  if (noteText.length > 2000) {
    throw createServiceError('Keep the note under 2000 characters.')
  }

  await connectToDatabase()
  const inquiry = await loadInquiry(id)

  if (!inquiry) {
    throw createServiceError('Inquiry not found.', 404)
  }

  inquiry.privateNotes.push({ text: noteText, author })
  await inquiry.save()

  return serializeShopInquiry(inquiry)
}

export const recordShopInquiryAssessment = async ({
  inquiryId,
  recommendation,
  reasons,
  missingInformation,
}) => {
  await connectToDatabase()
  const inquiry = await loadInquiry(inquiryId)

  if (!inquiry) {
    throw createServiceError('Inquiry not found.', 404)
  }

  inquiry.assistantAssessment = {
    recommendation,
    reasons,
    missingInformation,
    recordedAt: new Date(),
  }
  await inquiry.save()

  return serializeShopInquiry(inquiry)
}

export const claimInquiryForWorkOrder = async (inquiryId, workOrderId) => {
  await connectToDatabase()

  if (!mongoose.isValidObjectId(inquiryId)) {
    throw createServiceError('Choose an accepted inquiry before writing a quote.')
  }

  const claimedInquiry = await ShopInquiry.findOneAndUpdate(
    { _id: inquiryId, status: 'accepted', workOrderId: null },
    { $set: { workOrderId } },
    { returnDocument: 'after' },
  )

  if (claimedInquiry) {
    return claimedInquiry
  }

  const inquiry = await ShopInquiry.findById(inquiryId)

  if (!inquiry) {
    throw createServiceError('Inquiry not found.', 404)
  }

  if (inquiry.status !== 'accepted') {
    throw createServiceError('Accept the inquiry before writing a quote.')
  }

  throw createServiceError('This inquiry already has a work order.', 409)
}
