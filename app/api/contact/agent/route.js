import { NextResponse } from 'next/server'
import { isAgentContactEnabled } from '@/lib/agentContact/policy'
import { enforceAgentContactLimit } from '@/lib/services/agentContactService'
import { createContactSubmission } from '@/lib/services/contactService'
import { agentContactFieldsSchema, hashIpAddress } from '@/lib/validation/contact'

const getRemoteIp = (request) => {
  const forwardedFor = request.headers.get('x-forwarded-for')

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return request.headers.get('x-real-ip') || ''
}

export const POST = async (request) => {
  if (!isAgentContactEnabled()) {
    return NextResponse.json(
      {
        message: 'Agent contact is currently disabled.',
        code: 'agent_contact_disabled',
      },
      { status: 403 },
    )
  }

  const contentType = request.headers.get('content-type') || ''

  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json({ message: 'Content-Type must be application/json.' }, { status: 415 })
  }

  let body

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  try {
    const parsed = agentContactFieldsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid agent contact submission.', errors: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const remoteIp = getRemoteIp(request)
    const ipHash = hashIpAddress(remoteIp)
    const rawUserAgent = request.headers.get('user-agent') || ''
    let userAgent = ''

    if (rawUserAgent) {
      userAgent = rawUserAgent.slice(0, 500)
    }

    const breach = await enforceAgentContactLimit({
      ipHash,
      email: parsed.data.email,
      name: parsed.data.name,
      phone: parsed.data.phone,
      agentName: parsed.data.agentName,
      userAgent,
      message: parsed.data.message,
    })

    if (breach) {
      return NextResponse.json(
        {
          message: `Agent contact rate limit reached (${breach.subjectDetail}).`,
          code: 'agent_contact_rate_limited',
          limit: breach.limit,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(breach.retryAfterSeconds),
          },
        },
      )
    }

    const submission = await createContactSubmission({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      files: [],
      ipHash,
      source: 'agent',
      agentName: parsed.data.agentName,
      userAgent,
    })

    return NextResponse.json({
      message: 'Thank you. Your message has been received.',
      submission,
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to submit agent contact.' },
      { status: 500 },
    )
  }
}
