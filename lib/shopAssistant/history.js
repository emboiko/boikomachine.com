export const buildAgentInput = (messages, preamble, imageInputs) => {
  const items = []

  if (preamble) {
    items.push({
      role: 'system',
      content: preamble,
    })
  }

  for (const message of messages) {
    if (message.role === 'assistant') {
      items.push({
        role: 'assistant',
        status: 'completed',
        content: [{ type: 'output_text', text: message.text }],
      })
      continue
    }

    items.push({
      role: 'user',
      content: message.text,
    })
  }

  if (imageInputs && (imageInputs.images.length > 0 || imageInputs.note)) {
    const content = [{ type: 'input_text', text: imageInputs.note }]

    for (const image of imageInputs.images) {
      content.push({
        type: 'input_image',
        image: image.dataUrl,
      })
    }

    items.push({
      role: 'user',
      content,
    })
  }

  return items
}

export const readFinalAssistantText = (result) => {
  if (typeof result.finalOutput === 'string' && result.finalOutput.trim()) {
    return result.finalOutput.trim()
  }

  const outputItems = result.output || []
  let latestText = ''

  for (const item of outputItems) {
    if (!item || item.role !== 'assistant' || !Array.isArray(item.content)) {
      continue
    }

    const textParts = []

    for (const part of item.content) {
      if (part.type === 'output_text' && part.text) {
        textParts.push(part.text)
      }
    }

    if (textParts.length > 0) {
      latestText = textParts.join('')
    }
  }

  return latestText.trim()
}

export const readLatestUserText = (messages) => {
  if (!Array.isArray(messages)) {
    return ''
  }

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]

    if (!message || message.role !== 'user') {
      continue
    }

    if (typeof message.content === 'string') {
      return message.content.trim()
    }

    if (!Array.isArray(message.parts)) {
      return ''
    }

    const textParts = message.parts.filter((part) => {
      return part && part.type === 'text' && typeof part.text === 'string'
    })

    return textParts
      .map((part) => {
        return part.text
      })
      .join('')
      .trim()
  }

  return ''
}
