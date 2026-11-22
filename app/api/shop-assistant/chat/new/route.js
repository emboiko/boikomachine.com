import { NextResponse } from 'next/server'
import {
  PUBLIC_CHAT_COOKIE,
  createPublicChatSessionId,
  publicChatCookieOptions,
} from '@/lib/shopAssistant/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = async () => {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(PUBLIC_CHAT_COOKIE, createPublicChatSessionId(), publicChatCookieOptions())

  return response
}
