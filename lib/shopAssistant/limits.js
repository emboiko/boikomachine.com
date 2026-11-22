const readPositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback
  }

  return parsedValue
}

export const SHOP_ASSISTANT_LIMITS = {
  maxMessageCharacters: readPositiveInteger(
    process.env.SHOP_ASSISTANT_MAX_MESSAGE_CHARACTERS,
    2000,
  ),
  messagesPerIpPerHour: readPositiveInteger(
    process.env.SHOP_ASSISTANT_MESSAGES_PER_IP_PER_HOUR,
    40,
  ),
  maxMessagesPerTranscript: readPositiveInteger(
    process.env.SHOP_ASSISTANT_MAX_MESSAGES_PER_TRANSCRIPT,
    80,
  ),
}

export const SHOP_ASSISTANT_ADMIN_LIMITS = {
  maxMessageCharacters: readPositiveInteger(
    process.env.SHOP_ASSISTANT_ADMIN_MAX_MESSAGE_CHARACTERS,
    8000,
  ),
  maxMessagesPerTranscript: readPositiveInteger(
    process.env.SHOP_ASSISTANT_ADMIN_MAX_MESSAGES_PER_TRANSCRIPT,
    200,
  ),
}

export const messageTooLongText = (maxCharacters) => {
  return `Keep the message under ${maxCharacters} characters.`
}
