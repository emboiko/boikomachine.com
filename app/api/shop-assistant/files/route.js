import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { serviceErrorResponse } from '@/lib/api/adminGate'
import {
  addPublicTranscriptAttachment,
  removePublicTranscriptAttachment,
} from '@/lib/services/shopAssistantTranscriptService'
import {
  PUBLIC_CHAT_COOKIE,
  createPublicChatSessionId,
  publicChatCookieOptions,
  readPublicChatSessionId,
} from '@/lib/shopAssistant/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

export const POST = async (request) => {
  try {
    const sessionId = await resolvePublicSessionId(request)
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'Choose a file to attach.' }, { status: 400 })
    }

    const attachments = await addPublicTranscriptAttachment(sessionId, file)

    return NextResponse.json({ attachments })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to attach the file.')
  }
}

export const DELETE = async (request) => {
  try {
    const sessionId = readPublicChatSessionId(request)

    if (!sessionId) {
      return NextResponse.json({ message: 'File not found.' }, { status: 404 })
    }

    const body = await request.json()
    const attachmentId = typeof body.attachmentId === 'string' ? body.attachmentId : ''

    if (!attachmentId) {
      return NextResponse.json({ message: 'File not found.' }, { status: 404 })
    }

    const attachments = await removePublicTranscriptAttachment(sessionId, attachmentId)

    return NextResponse.json({ attachments })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to remove the file.')
  }
}
