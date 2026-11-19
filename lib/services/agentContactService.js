import { AGENT_CONTACT_LIMITS } from '@/lib/agentContact/policy'
import { connectToDatabase } from '@/lib/db/mongoose'
import { AgentContactLimitNotice } from '@/lib/models/AgentContactLimitNotice'
import { ContactSubmission } from '@/lib/models/ContactSubmission'
import { notifyAgentContactLimitReached } from '@/lib/services/contactService'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

const getWindowStart = (windowMs) => {
  return new Date(Date.now() - windowMs)
}

const getUtcHourKey = () => {
  const bucket = new Date()
  bucket.setUTCMinutes(0, 0, 0)
  return bucket.toISOString()
}

const getUtcDayKey = () => {
  const bucket = new Date()
  bucket.setUTCHours(0, 0, 0, 0)
  return bucket.toISOString()
}

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const getRetryAfterSeconds = async (filter, windowMs) => {
  const oldestSubmission = await ContactSubmission.findOne(filter)
    .sort({ createdAt: 1 })
    .select('createdAt')
    .lean()

  if (!oldestSubmission || !oldestSubmission.createdAt) {
    return Math.ceil(windowMs / 1000)
  }

  const retryAtMs = new Date(oldestSubmission.createdAt).getTime() + windowMs
  const remainingMs = retryAtMs - Date.now()

  if (remainingMs <= 1000) {
    return 1
  }

  return Math.ceil(remainingMs / 1000)
}

const buildIpBreach = async (ipHash) => {
  const filter = {
    source: 'agent',
    ipHash,
    createdAt: { $gte: getWindowStart(HOUR_MS) },
  }
  const count = await ContactSubmission.countDocuments(filter)

  if (count < AGENT_CONTACT_LIMITS.ipPerHour) {
    return null
  }

  return {
    limit: 'ip_per_hour',
    subjectDetail: `${AGENT_CONTACT_LIMITS.ipPerHour} per IP per hour`,
    description: `${AGENT_CONTACT_LIMITS.ipPerHour} agent submissions per IP hash per hour`,
    threshold: AGENT_CONTACT_LIMITS.ipPerHour,
    count,
    noticeKey: `ip:${ipHash}:${getUtcHourKey()}`,
    retryAfterSeconds: await getRetryAfterSeconds(filter, HOUR_MS),
  }
}

const buildEmailBreach = async (email) => {
  const normalizedEmail = email.trim().toLowerCase()
  const filter = {
    source: 'agent',
    email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' },
    createdAt: { $gte: getWindowStart(DAY_MS) },
  }
  const count = await ContactSubmission.countDocuments(filter)

  if (count < AGENT_CONTACT_LIMITS.emailPerDay) {
    return null
  }

  return {
    limit: 'email_per_day',
    subjectDetail: `${AGENT_CONTACT_LIMITS.emailPerDay} per email per 24 hours`,
    description: `${AGENT_CONTACT_LIMITS.emailPerDay} agent submissions per email address per 24 hours`,
    threshold: AGENT_CONTACT_LIMITS.emailPerDay,
    count,
    noticeKey: `email:${normalizedEmail}:${getUtcDayKey()}`,
    retryAfterSeconds: await getRetryAfterSeconds(filter, DAY_MS),
  }
}

const buildSiteBreach = async () => {
  const filter = {
    source: 'agent',
    createdAt: { $gte: getWindowStart(DAY_MS) },
  }
  const count = await ContactSubmission.countDocuments(filter)

  if (count < AGENT_CONTACT_LIMITS.sitePerDay) {
    return null
  }

  return {
    limit: 'site_per_day',
    subjectDetail: `${AGENT_CONTACT_LIMITS.sitePerDay} site-wide per 24 hours`,
    description: `${AGENT_CONTACT_LIMITS.sitePerDay} agent submissions site-wide per 24 hours`,
    threshold: AGENT_CONTACT_LIMITS.sitePerDay,
    count,
    noticeKey: `site:${getUtcDayKey()}`,
    retryAfterSeconds: await getRetryAfterSeconds(filter, DAY_MS),
  }
}

const findBreach = async ({ ipHash, email }) => {
  if (ipHash) {
    const ipBreach = await buildIpBreach(ipHash)

    if (ipBreach) {
      return ipBreach
    }
  }

  const emailBreach = await buildEmailBreach(email)

  if (emailBreach) {
    return emailBreach
  }

  return buildSiteBreach()
}

const notifyFirstBreach = async (breach, attempt) => {
  try {
    await AgentContactLimitNotice.create({ key: breach.noticeKey })
  } catch {
    return
  }

  try {
    await notifyAgentContactLimitReached({
      subjectDetail: breach.subjectDetail,
      description: breach.description,
      threshold: breach.threshold,
      count: breach.count,
      ipHash: attempt.ipHash,
      name: attempt.name,
      email: attempt.email,
      phone: attempt.phone,
      agentName: attempt.agentName,
      userAgent: attempt.userAgent,
      message: attempt.message,
    })
  } catch {
    return
  }
}

export const enforceAgentContactLimit = async (attempt) => {
  await connectToDatabase()

  const breach = await findBreach(attempt)

  if (!breach) {
    return null
  }

  await notifyFirstBreach(breach, attempt)
  return breach
}
