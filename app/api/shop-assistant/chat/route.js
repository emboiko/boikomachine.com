import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { hashIpAddress } from '@/lib/validation/contact'
import { getShopInquiry } from '@/lib/services/shopInquiryService'
import {
  countRecentPublicUserMessages,
  getOrCreateTranscript,
  serializePublicAttachments,
  serializeTranscriptMessages,
  transcriptHasRoom,
} from '@/lib/services/shopAssistantTranscriptService'
import { ShopAssistantTranscript } from '@/lib/models/ShopAssistantTranscript'
import { connectToDatabase } from '@/lib/db/mongoose'
import { createPublicAgent } from '@/lib/shopAssistant/publicAgent'
import { readLatestUserText } from '@/lib/shopAssistant/history'
import { SHOP_ASSISTANT_LIMITS, messageTooLongText } from '@/lib/shopAssistant/limits'
import { rememberUserMessage, streamShopAssistantTurn } from '@/lib/shopAssistant/runTurn'
import {
  PUBLIC_CHAT_COOKIE,
  createPublicChatSessionId,
  publicChatCookieOptions,
  readPublicChatSessionId,
} from '@/lib/shopAssistant/session'
import { serviceErrorResponse } from '@/lib/api/adminGate'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const readIpHash = (request) => {
  const remoteIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    ''

  return hashIpAddress(remoteIp) || 'unknown'
}

const resolvePublicSessionId = async (request) => {
  const existingSessionId = readPublicChatSessionId(request)

  if (existingSessionId) {
    return existingSessionId
  }

  const sessionId = createPublicChatSessionId()
  const cookieStore = await cookies()
  cookieStore.set(PUBLIC_CHAT_COOKIE, sessionId, publicChatCookieOptions())

  return sessionId
}

const loadPublicTranscript = async (sessionId) => {
  await connectToDatabase()
  return ShopAssistantTranscript.findOne({ audience: 'public', sessionId })
}

export const GET = async (request) => {
  try {
    const sessionId = await resolvePublicSessionId(request)
    const transcript = await loadPublicTranscript(sessionId)

    return NextResponse.json({
      messages: serializeTranscriptMessages(transcript),
      attachments: serializePublicAttachments(transcript),
      maxMessageCharacters: SHOP_ASSISTANT_LIMITS.maxMessageCharacters,
    })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to load the shop assistant conversation.')
  }
}

export const POST = async (request) => {
  try {
    const sessionId = await resolvePublicSessionId(request)
    const body = await request.json()
    const userText = readLatestUserText(body.messages)

    if (!userText) {
      return NextResponse.json({ message: 'Write a message first.' }, { status: 400 })
    }

    if (userText.length > SHOP_ASSISTANT_LIMITS.maxMessageCharacters) {
      return NextResponse.json(
        { message: messageTooLongText(SHOP_ASSISTANT_LIMITS.maxMessageCharacters) },
        { status: 400 },
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: 'The shop assistant is unavailable right now.' },
        { status: 503 },
      )
    }

    const ipHash = readIpHash(request)
    const recentMessageCount = await countRecentPublicUserMessages(ipHash)

    if (recentMessageCount >= SHOP_ASSISTANT_LIMITS.messagesPerIpPerHour) {
      return NextResponse.json(
        { message: 'The shop assistant is busy right now. Please try again later or use the contact form.' },
        { status: 429 },
      )
    }

    const transcript = await getOrCreateTranscript({
      audience: 'public',
      sessionId,
      ipHash,
    })

    if (!transcriptHasRoom(transcript, SHOP_ASSISTANT_LIMITS.maxMessagesPerTranscript)) {
      return NextResponse.json(
        { message: 'This conversation is full. Use the contact form to reach the shop.' },
        { status: 429 },
      )
    }

    const transcriptWithUserMessage = await rememberUserMessage(transcript, userText)
    const preambleParts = []
    const attachmentNames = (transcriptWithUserMessage.attachments || []).map((attachment) => {
      return attachment.originalName
    })

    if (attachmentNames.length > 0) {
      preambleParts.push(
        `The visitor already attached these files in the chat: ${attachmentNames.join(', ')}. They will be saved with the inquiry. You cannot see the file contents. Do not describe what a file shows.`,
      )
    }

    if (transcriptWithUserMessage.inquiryId) {
      try {
        const inquiry = await getShopInquiry(transcriptWithUserMessage.inquiryId.toString())
        preambleParts.push(
          `This conversation already submitted shop inquiry ${inquiry.referenceCode}. Do not call submitShopInquiry again.`,
        )
      } catch {
        preambleParts.push(
          'This conversation already submitted a shop inquiry. Do not call submitShopInquiry again.',
        )
      }
    }

    const preamble = preambleParts.join('\n\n')

    return await streamShopAssistantTurn({
      agent: createPublicAgent(),
      transcript: transcriptWithUserMessage,
      preamble,
      workflowName: 'Boiko public shop assistant',
    })
  } catch (error) {
    return serviceErrorResponse(error, 'The shop assistant could not reply.')
  }
}
