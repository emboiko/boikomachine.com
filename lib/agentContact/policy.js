export const AGENT_CONTACT_LIMITS = {
  // These are super arbitrary for now.
  ipPerHour: process.env.AGENT_CONTACT_IP_PER_HOUR,
  emailPerDay: process.env.AGENT_CONTACT_EMAIL_PER_DAY,
  sitePerDay: process.env.AGENT_CONTACT_SITE_PER_DAY,
}

export const isAgentContactEnabled = () => {
  const value = process.env.AGENT_CONTACT_ENABLED

  if (value === undefined || value === '') {
    return true
  }

  const normalizedValue = value.trim().toLowerCase()

  if (normalizedValue === 'false' || normalizedValue === '0') {
    return false
  }

  return true
}
