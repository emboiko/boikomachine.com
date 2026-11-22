import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import { ensureAdmin, serviceErrorResponse } from '@/lib/api/adminGate'
import { getShopInquiry } from '@/lib/services/shopInquiryService'
import {
  getOrCreateTranscript,
  serializeTranscriptMessages,
  transcriptHasRoom,
} from '@/lib/services/shopAssistantTranscriptService'
import { ShopAssistantTranscript } from '@/lib/models/ShopAssistantTranscript'
import { connectToDatabase } from '@/lib/db/mongoose'
import { createAdminAgent } from '@/lib/shopAssistant/adminAgent'
import { readLatestUserText } from '@/lib/shopAssistant/history'
import { SHOP_ASSISTANT_ADMIN_LIMITS, messageTooLongText } from '@/lib/shopAssistant/limits'
import { rememberUserMessage, streamShopAssistantTurn } from '@/lib/shopAssistant/runTurn'
import { readAdminCopilotSessionId } from '@/lib/shopAssistant/session'
import { loadInquiryVisionInput } from '@/lib/shopAssistant/inquiryImages'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const readInquiryId = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  const inquiryId = value.trim()

  if (!inquiryId) {
    return ''
  }

  if (!mongoose.isValidObjectId(inquiryId)) {
    return null
  }

  return inquiryId
}

const adminSessionId = (inquiryId, request) => {
  if (inquiryId) {
    return `inquiry:${inquiryId}`
  }

  return readAdminCopilotSessionId(request)
}

const buildAdminPreamble = (inquiry) => {
  if (!inquiry) {
    return 'No inquiry is open. Answer from the shop facts, or call listOpenInquiries with statusGroup "open".'
  }

  return [
    `The owner has inquiry ${inquiry.referenceCode} open.`,
    `Inquiry id: ${inquiry.id}`,
    `Status: ${inquiry.status}`,
    `Customer: ${inquiry.customerName} <${inquiry.customerEmail}>`,
    `Summary: ${inquiry.summary}`,
    'Call getInquiry with this inquiry id before giving a feasibility recommendation, so you see private notes.',
  ].join('\n')
}

export const GET = async (request) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const inquiryId = readInquiryId(request.nextUrl.searchParams.get('inquiryId'))

    if (inquiryId === null) {
      return NextResponse.json({ message: 'Inquiry not found.' }, { status: 404 })
    }

    if (inquiryId) {
      await getShopInquiry(inquiryId)
    }

    await connectToDatabase()
    const transcript = await ShopAssistantTranscript.findOne({
      audience: 'admin',
      sessionId: adminSessionId(inquiryId, request),
    })

    return NextResponse.json({
      messages: serializeTranscriptMessages(transcript),
      maxMessageCharacters: SHOP_ASSISTANT_ADMIN_LIMITS.maxMessageCharacters,
      messageLimit: SHOP_ASSISTANT_ADMIN_LIMITS.maxMessagesPerTranscript,
    })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to load the shop copilot conversation.')
  }
}

export const POST = async (request) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const body = await request.json()
    const inquiryId = readInquiryId(body.inquiryId)
    const userText = readLatestUserText(body.messages)

    if (inquiryId === null) {
      return NextResponse.json({ message: 'Inquiry not found.' }, { status: 404 })
    }

    if (!userText) {
      return NextResponse.json({ message: 'Write a message first.' }, { status: 400 })
    }

    if (userText.length > SHOP_ASSISTANT_ADMIN_LIMITS.maxMessageCharacters) {
      return NextResponse.json(
        { message: messageTooLongText(SHOP_ASSISTANT_ADMIN_LIMITS.maxMessageCharacters) },
        { status: 400 },
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: 'The shop assistant is unavailable right now.' },
        { status: 503 },
      )
    }

    let inquiry = null

    if (inquiryId) {
      inquiry = await getShopInquiry(inquiryId)
    }

    const transcript = await getOrCreateTranscript({
      audience: 'admin',
      sessionId: adminSessionId(inquiryId, request),
      ipHash: '',
    })

    if (inquiry && !transcript.inquiryId) {
      transcript.inquiryId = inquiry.id
      await transcript.save()
    }

    if (!transcriptHasRoom(transcript, SHOP_ASSISTANT_ADMIN_LIMITS.maxMessagesPerTranscript)) {
      return NextResponse.json(
        { message: 'This copilot conversation is full.' },
        { status: 429 },
      )
    }

    const transcriptWithUserMessage = await rememberUserMessage(transcript, userText)
    let imageInputs = null

    if (inquiry && inquiry.attachments && inquiry.attachments.length > 0) {
      const visionInput = await loadInquiryVisionInput(inquiry.attachments)

      if (visionInput.hasFiles) {
        imageInputs = {
          note: visionInput.note,
          images: visionInput.images,
        }
      }
    }

    return await streamShopAssistantTurn({
      agent: createAdminAgent(),
      transcript: transcriptWithUserMessage,
      preamble: buildAdminPreamble(inquiry),
      workflowName: 'Boiko shop copilot',
      imageInputs,
    })
  } catch (error) {
    return serviceErrorResponse(error, 'The shop copilot could not reply.')
  }
}
