import { BUSINESS } from '@/lib/constants'
import { buildPayUrl, buildQuoteUrl } from '@/lib/billing/payUrl'
import { documentLabelForWorkStatus } from '@/lib/billing/statuses'

const QUOTE_PLACEHOLDER_LINE = 'Quote: assigned when this work order is saved'
const INVOICE_PLACEHOLDER_LINE = 'Invoice: assigned when this work order is saved'
const QUOTE_PAY_PLACEHOLDER_LINE = 'Pay by card at the link on the quote, by check, or in cash.'
const INVOICE_PAY_PLACEHOLDER_LINE = 'Pay by card at the link on the invoice, by check, or in cash.'
const HEADING_LINE_PATTERN = /^(?:Quote|Invoice): .+$/m

const payLineForCode = (invoiceCode, workStatus) => {
  let documentUrl = buildQuoteUrl(invoiceCode)

  if (workStatus === 'completed') {
    documentUrl = buildPayUrl(invoiceCode)
  }

  return `Pay by card at ${documentUrl}, by check payable to ${BUSINESS.name}, or in cash.`
}

export const applyDocumentHeading = (contractText, invoiceCode, workStatus) => {
  const label = documentLabelForWorkStatus(workStatus)
  const headingLine = `${label}: ${invoiceCode}`
  const payLine = payLineForCode(invoiceCode, workStatus)
  const quoteUrl = buildQuoteUrl(invoiceCode)
  const payUrl = buildPayUrl(invoiceCode)
  let nextText = contractText || ''

  nextText = nextText.replaceAll(QUOTE_PLACEHOLDER_LINE, headingLine)
  nextText = nextText.replaceAll(INVOICE_PLACEHOLDER_LINE, headingLine)
  nextText = nextText.replaceAll(QUOTE_PAY_PLACEHOLDER_LINE, payLine)
  nextText = nextText.replaceAll(INVOICE_PAY_PLACEHOLDER_LINE, payLine)

  if (workStatus === 'completed') {
    nextText = nextText.replaceAll(quoteUrl, payUrl)
  } else {
    nextText = nextText.replaceAll(payUrl, quoteUrl)
  }

  if (HEADING_LINE_PATTERN.test(nextText)) {
    nextText = nextText.replace(HEADING_LINE_PATTERN, headingLine)
  }

  return nextText
}

export const buildContractText = ({ invoiceCode, workStatus = 'created' }) => {
  let payLine = QUOTE_PAY_PLACEHOLDER_LINE

  if (workStatus === 'completed') {
    payLine = INVOICE_PAY_PLACEHOLDER_LINE
  }

  if (invoiceCode) {
    payLine = payLineForCode(invoiceCode, workStatus)
  }

  return [
    payLine,
    'The deposit is due before work starts and is not financed. The remaining balance is due as one payment when the parts are finished.',
    '',
    `${BUSINESS.name} will do the work listed above. The customer agrees to pay the deposit and the remaining balance on those terms.`,
  ].join('\n')
}
