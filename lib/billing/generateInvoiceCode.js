import { randomBytes } from 'crypto'

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export const generateInvoiceCode = () => {
  const bytes = randomBytes(8)
  let suffix = ''

  for (const byte of bytes) {
    const index = byte % ALPHABET.length
    suffix += ALPHABET[index]
  }

  return `BMT-${suffix}`
}
