export const buildQuoteTitle = (summary) => {
  const singleLine = String(summary || '')
    .replace(/\s+/g, ' ')
    .trim()

  if (singleLine.length <= 120) {
    return singleLine
  }

  return `${singleLine.slice(0, 117)}...`
}
