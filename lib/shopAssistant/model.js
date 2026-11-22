const DEFAULT_OPENAI_MODEL = 'gpt-6.2-sol'

export const getShopAssistantModel = () => {
  const model = process.env.OPENAI_MODEL

  if (model && model.trim()) {
    return model.trim()
  }

  return DEFAULT_OPENAI_MODEL
}
