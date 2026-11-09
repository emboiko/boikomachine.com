import { parseJsonResponse } from '@/services/client/parseJsonResponse'

export const fetchPayInvoice = async (invoiceCode) => {
  const response = await fetch(`/api/pay/${encodeURIComponent(invoiceCode)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  const data = await parseJsonResponse(response)
  return data.invoice
}

export const confirmPayPayment = async (invoiceCode, paymentIntentId) => {
  const response = await fetch(`/api/pay/${encodeURIComponent(invoiceCode)}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ paymentIntentId }),
  })

  return parseJsonResponse(response)
}
