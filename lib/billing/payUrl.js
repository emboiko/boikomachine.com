import { BUSINESS } from '@/lib/constants'

const siteOrigin = () => {
  return BUSINESS.siteUrl.replace(/\/$/, '')
}

export const buildPayUrl = (invoiceCode) => {
  return `${siteOrigin()}/pay/${invoiceCode}`
}

export const buildQuoteUrl = (invoiceCode) => {
  return `${siteOrigin()}/quote/${invoiceCode}`
}
