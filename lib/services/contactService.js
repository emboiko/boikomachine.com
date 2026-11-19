import { Resend } from 'resend'
import { connectToDatabase } from '@/lib/db/mongoose'
import { ContactSubmission } from '@/lib/models/ContactSubmission'
import {
  uploadContactFiles,
  getContactAttachmentDownloadUrl,
  formatFileSize,
} from '@/lib/storage/blob'
import { BUSINESS } from '@/lib/constants'

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    return null
  }

  return new Resend(apiKey)
}

const formatOptionalValue = (value) => {
  if (!value) {
    return 'not provided'
  }

  return String(value)
}

const formatSingleLine = (value) => {
  if (!value) {
    return 'not provided'
  }

  return String(value)
    .replace(/[\r\n]+/g, ' ')
    .slice(0, 500)
}

const truncateMessage = (message) => {
  const maximumLength = 500

  if (!message) {
    return 'not provided'
  }

  if (message.length <= maximumLength) {
    return message
  }

  return `${message.slice(0, maximumLength)}...`
}

const buildContactFormEmail = (submission) => {
  const attachmentLines = submission.attachments
    .map((attachment, index) => {
      const downloadUrl = getContactAttachmentDownloadUrl(
        attachment.storageKey,
        attachment.originalName,
      )
      const sizeLabel = formatFileSize(attachment.sizeBytes)

      return [`${index + 1}. ${attachment.originalName} (${sizeLabel})`, `   ${downloadUrl}`].join(
        '\n',
      )
    })
    .join('\n')

  const attachmentSection =
    submission.attachments.length > 0
      ? ['', 'Attachments:', attachmentLines].join('\n')
      : '\n\nAttachments: none'

  return {
    subject: `New contact submission - ${submission.name}`,
    text: [
      `New contact form submission for ${BUSINESS.name}`,
      '',
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Phone: ${submission.phone || 'not provided'}`,
      '',
      'Message:',
      submission.message,
      attachmentSection,
    ].join('\n'),
  }
}

const buildAgentInquiryEmail = (submission) => {
  return {
    subject: `New agent inquiry - ${submission.name}`,
    text: [
      `New agent inquiry for ${BUSINESS.name}`,
      '',
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Phone: ${formatOptionalValue(submission.phone)}`,
      `Agent: ${formatOptionalValue(submission.agentName)}`,
      `User-Agent: ${formatSingleLine(submission.userAgent)}`,
      '',
      'Message:',
      submission.message,
      '',
      'Attachments: none',
    ].join('\n'),
  }
}

const buildNotificationEmail = (submission) => {
  if (submission.source === 'agent') {
    return buildAgentInquiryEmail(submission)
  }

  return buildContactFormEmail(submission)
}

export const sendContactNotification = async (submission) => {
  const resend = getResendClient()

  if (!resend) {
    return { sent: false, reason: 'RESEND_API_KEY not configured' }
  }

  const emailContent = buildNotificationEmail(submission)

  await resend.emails.send({
    from: `${BUSINESS.name} <${BUSINESS.shopEmail}>`,
    to: BUSINESS.shopEmail,
    replyTo: submission.email,
    subject: emailContent.subject,
    text: emailContent.text,
  })

  return { sent: true }
}

export const notifyAgentContactLimitReached = async ({
  subjectDetail,
  description,
  threshold,
  count,
  ipHash,
  name,
  email,
  phone,
  agentName,
  userAgent,
  message,
}) => {
  const resend = getResendClient()

  if (!resend) {
    return { sent: false, reason: 'RESEND_API_KEY not configured' }
  }

  await resend.emails.send({
    from: `${BUSINESS.name} <${BUSINESS.shopEmail}>`,
    to: BUSINESS.shopEmail,
    subject: `Agent contact limit reached - ${subjectDetail}`,
    text: [
      `Agent contact limit reached for ${BUSINESS.name}`,
      '',
      `Limit: ${description}`,
      `Threshold: ${threshold}`,
      `Accepted in the current window: ${count}`,
      'This request was rejected.',
      '',
      `IP hash: ${formatOptionalValue(ipHash)}`,
      `Name: ${formatOptionalValue(name)}`,
      `Email: ${formatOptionalValue(email)}`,
      `Phone: ${formatOptionalValue(phone)}`,
      `Agent: ${formatOptionalValue(agentName)}`,
      `User-Agent: ${formatSingleLine(userAgent)}`,
      `Timestamp: ${new Date().toISOString()}`,
      '',
      'Rejected message:',
      truncateMessage(message),
    ].join('\n'),
  })

  return { sent: true }
}

export const createContactSubmission = async ({
  name,
  email,
  phone,
  message,
  files,
  ipHash,
  source = 'contact_form',
  agentName,
  userAgent,
}) => {
  await connectToDatabase()

  const attachments = await uploadContactFiles(files)

  const submission = await ContactSubmission.create({
    name,
    email,
    phone: phone || undefined,
    message,
    attachments,
    source,
    agentName: agentName || undefined,
    userAgent: userAgent || undefined,
    ipHash,
  })

  let emailResult = { sent: false, reason: 'not attempted' }

  try {
    emailResult = await sendContactNotification(submission)
  } catch (error) {
    emailResult = { sent: false, reason: error.message }
  }

  return {
    id: submission._id.toString(),
    emailSent: emailResult.sent,
  }
}
