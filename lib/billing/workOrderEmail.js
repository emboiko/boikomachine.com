import { Resend } from 'resend'
import { BUSINESS } from '@/lib/constants'
import {
  getCustomerEmailLogoAttachment,
  wrapCustomerBillingEmail,
} from '@/lib/billing/emailLayout'
import { buildPayUrl, buildQuoteUrl } from '@/lib/billing/payUrl'
import { documentLabelForWorkStatus, PAYMENT_METHOD_LABELS } from '@/lib/billing/statuses'
import { formatCents } from '@/lib/money'

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    return null
  }

  return new Resend(apiKey)
}

const sendBillingEmail = async ({ to, subject, text, html, attachments, bccShop = true }) => {
  const resend = getResendClient()

  if (!resend) {
    return { sent: false, reason: 'RESEND_API_KEY not configured' }
  }

  if (!to) {
    return { sent: false, reason: 'Customer email is missing' }
  }

  const message = {
    from: `${BUSINESS.name} <${BUSINESS.shopEmail}>`,
    to,
    subject,
    text,
  }

  if (html) {
    message.html = html
  }

  if (attachments && attachments.length > 0) {
    message.attachments = attachments
  }

  if (bccShop && to.toLowerCase() !== BUSINESS.shopEmail.toLowerCase()) {
    message.bcc = BUSINESS.shopEmail
  }

  await resend.emails.send(message)

  return { sent: true }
}

const sendCustomerBillingEmail = async ({ to, subject, text, bccShop = true }) => {
  const wrapped = wrapCustomerBillingEmail(text)
  const logoAttachment = await getCustomerEmailLogoAttachment()

  return sendBillingEmail({
    to,
    subject,
    text: wrapped.text,
    html: wrapped.html,
    attachments: [logoAttachment],
    bccShop,
  })
}

const documentNoun = (workOrder) => {
  return documentLabelForWorkStatus(workOrder.workStatus).toLowerCase()
}

const balanceParagraph = (workOrder, billing, payUrl) => {
  const noun = documentNoun(workOrder)

  if (billing.balanceOutstandingCents <= 0) {
    return `This ${noun} is paid in full.`
  }

  if (workOrder.workStatus !== 'completed') {
    return `Remaining balance: ${formatCents(billing.balanceOutstandingCents)}. That balance is due when the job is finished.`
  }

  return `Remaining balance: ${formatCents(billing.balanceOutstandingCents)}. Pay at ${payUrl}`
}

const sendShopPaymentNotice = async ({ subject, text }) => {
  return sendBillingEmail({
    to: BUSINESS.shopEmail,
    subject,
    text,
    bccShop: false,
  })
}

export const sendQuoteEmail = async (workOrder) => {
  const quoteUrl = buildQuoteUrl(workOrder.invoiceCode)
  const text = [
    `${BUSINESS.name} quote ${workOrder.invoiceCode}`,
    '',
    `Job: ${workOrder.title}`,
    '',
    `View your quote: ${quoteUrl}`,
  ].join('\n')

  return sendCustomerBillingEmail({
    to: workOrder.customerEmail,
    subject: `Quote ${workOrder.invoiceCode} from ${BUSINESS.name}`,
    text,
  })
}

export const sendInvoiceEmail = async (workOrder, billing) => {
  const payUrl = buildPayUrl(workOrder.invoiceCode)
  const text = [
    `${BUSINESS.name} invoice ${workOrder.invoiceCode}`,
    '',
    `Job: ${workOrder.title}`,
    `Total: ${formatCents(billing.totalCents)}`,
    `Paid to date: ${formatCents(billing.amountPaidCents)}`,
    balanceParagraph(workOrder, billing, payUrl),
    '',
    workOrder.contractText,
  ].join('\n')

  return sendCustomerBillingEmail({
    to: workOrder.customerEmail,
    subject: `Invoice ${workOrder.invoiceCode} from ${BUSINESS.name}`,
    text,
  })
}

export const sendDepositReceivedEmail = async ({ workOrder, payment, billing }) => {
  const payUrl = buildPayUrl(workOrder.invoiceCode)
  const methodLabel = PAYMENT_METHOD_LABELS[payment.method] || payment.method
  const noun = documentNoun(workOrder)
  const customerText = [
    `We received your ${methodLabel.toLowerCase()} deposit of ${formatCents(payment.amountCents)} for ${noun} ${workOrder.invoiceCode}.`,
    '',
    `Job: ${workOrder.title}`,
    `Total: ${formatCents(billing.totalCents)}`,
    `Paid to date: ${formatCents(billing.amountPaidCents)}`,
    balanceParagraph(workOrder, billing, payUrl),
    '',
    "We're starting work on your parts now. We'll be in touch when they're finished.",
  ].join('\n')

  const customerResult = await sendCustomerBillingEmail({
    to: workOrder.customerEmail,
    subject: `Deposit received for ${workOrder.invoiceCode}`,
    text: customerText,
    bccShop: false,
  })

  if (customerResult.sent) {
    const shopText = [
      `Deposit received for ${workOrder.invoiceCode}. Job status is now in-progress.`,
      '',
      `Customer: ${workOrder.customerName}`,
      `Customer email: ${workOrder.customerEmail}`,
      `Job: ${workOrder.title}`,
      `Deposit: ${formatCents(payment.amountCents)} via ${methodLabel.toLowerCase()}`,
      `Total: ${formatCents(billing.totalCents)}`,
      `Paid to date: ${formatCents(billing.amountPaidCents)}`,
      balanceParagraph(workOrder, billing, payUrl),
    ].join('\n')

    try {
      await sendShopPaymentNotice({
        subject: `Start work: deposit received for ${workOrder.invoiceCode}`,
        text: shopText,
      })
    } catch {
      // The customer receipt already went out. Do not fail the payment flow over the shop notice.
    }
  }

  return customerResult
}

export const sendPaidInFullEmail = async ({ workOrder, payment, billing }) => {
  const methodLabel = PAYMENT_METHOD_LABELS[payment.method] || payment.method
  const noun = documentNoun(workOrder)
  const customerText = [
    `We received your ${methodLabel.toLowerCase()} payment of ${formatCents(payment.amountCents)} for ${noun} ${workOrder.invoiceCode}.`,
    '',
    `Job: ${workOrder.title}`,
    `Total: ${formatCents(billing.totalCents)}`,
    `Paid to date: ${formatCents(billing.amountPaidCents)}`,
    `This ${noun} is paid in full.`,
  ].join('\n')

  const customerResult = await sendCustomerBillingEmail({
    to: workOrder.customerEmail,
    subject: `Payment received for ${workOrder.invoiceCode}`,
    text: customerText,
    bccShop: false,
  })

  if (customerResult.sent) {
    const shopText = [
      `Paid in full for ${workOrder.invoiceCode}.`,
      '',
      `Customer: ${workOrder.customerName}`,
      `Customer email: ${workOrder.customerEmail}`,
      `Job: ${workOrder.title}`,
      `Payment: ${formatCents(payment.amountCents)} via ${methodLabel.toLowerCase()}`,
      `Total: ${formatCents(billing.totalCents)}`,
      `Paid to date: ${formatCents(billing.amountPaidCents)}`,
    ].join('\n')

    try {
      await sendShopPaymentNotice({
        subject: `Paid in full: ${workOrder.invoiceCode}`,
        text: shopText,
      })
    } catch {
      // The customer receipt already went out. Do not fail the payment flow over the shop notice.
    }
  }

  return customerResult
}
