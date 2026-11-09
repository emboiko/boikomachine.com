import { NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/auth/session'

export const ensureAdmin = async (request) => {
  const session = await getAdminSessionFromRequest(request)

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ message: 'Unauthorized.' }, { status: 401 }),
    }
  }

  return { session, response: null }
}

export const serviceErrorResponse = (error, fallbackMessage) => {
  const status = error.status || 500

  if (status >= 500) {
    return NextResponse.json({ message: fallbackMessage, error: error.message }, { status })
  }

  return NextResponse.json({ message: error.message }, { status })
}
