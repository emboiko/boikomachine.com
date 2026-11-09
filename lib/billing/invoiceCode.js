export const INVOICE_CODE_PATTERN = /^BMT-[0-9A-HJKMNP-TV-Z]{8}$/

export const normalizeInvoiceCode = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().toUpperCase()
}

export const isInvoiceCode = (value) => {
  return INVOICE_CODE_PATTERN.test(value)
}
