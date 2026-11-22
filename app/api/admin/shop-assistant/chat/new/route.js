import { NextResponse } from 'next/server'
import { ensureAdmin, serviceErrorResponse } from '@/lib/api/adminGate'
import {
  ADMIN_COPILOT_COOKIE,
  createPublicChatSessionId,
  publicChatCookieOptions,
} from '@/lib/shopAssistant/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = async (request) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const response = NextResponse.json({ ok: true })
    response.cookies.set(ADMIN_COPILOT_COOKIE, createPublicChatSessionId(), publicChatCookieOptions())

    return response
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to start a new shop copilot chat.')
  }
}
