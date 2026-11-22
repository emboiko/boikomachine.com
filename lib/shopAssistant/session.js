import { randomUUID } from 'crypto'

export const PUBLIC_CHAT_COOKIE = 'boiko_shop_chat'
export const ADMIN_COPILOT_COOKIE = 'boiko_admin_copilot'
const GENERAL_ADMIN_SESSION = 'admin-general'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const readPublicChatSessionId = (request) => {
  const sessionId = request.cookies.get(PUBLIC_CHAT_COOKIE)?.value

  if (!sessionId || !SESSION_ID_PATTERN.test(sessionId)) {
    return ''
  }

  return sessionId
}

export const createPublicChatSessionId = () => {
  return randomUUID()
}

export const publicChatCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}

export const readAdminCopilotSessionId = (request) => {
  const sessionId = request.cookies.get(ADMIN_COPILOT_COOKIE)?.value

  if (!sessionId || !SESSION_ID_PATTERN.test(sessionId)) {
    return GENERAL_ADMIN_SESSION
  }

  return `general:${sessionId}`
}
