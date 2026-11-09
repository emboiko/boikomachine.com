import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/db/mongoose'
import { applyDocumentHeading, buildContractText } from '@/lib/billing/contractTemplate'
import { deriveBilling } from '@/lib/billing/deriveBilling'
import { generateInvoiceCode } from '@/lib/billing/generateInvoiceCode'
import { isInvoiceCode, normalizeInvoiceCode } from '@/lib/billing/invoiceCode'
import { getStripeClient } from '@/lib/billing/stripeClient'
import { PAYMENT_KINDS } from '@/lib/billing/statuses'
import {
  sendDepositReceivedEmail,
  sendInvoiceEmail,
  sendPaidInFullEmail,
  sendQuoteEmail,
} from '@/lib/billing/workOrderEmail'
import { Payment } from '@/lib/models/Payment'
import { WorkOrder } from '@/lib/models/WorkOrder'
import { assertCents, subtractCents, sumCents } from '@/lib/money'

const INVOICE_NOT_FOUND_MESSAGE = "We couldn't find a quote or invoice with that code."

const ALLOWED_WORK_TRANSITIONS = {
  created: ['pending', 'in_progress'],
  pending: ['in_progress'],
  in_progress: ['completed'],
  completed: [],
}

const createServiceError = (message, status = 400) => {
  const error = new Error(message)
  error.status = status
  return error
}

const assertWorkStatusTransition = (fromStatus, toStatus) => {
  const allowedStatuses = ALLOWED_WORK_TRANSITIONS[fromStatus] || []

  if (!allowedStatuses.includes(toStatus)) {
    throw createServiceError(`Cannot move a work order from ${fromStatus} to ${toStatus}.`)
  }
}

const assertChargeShape = (lineItems, depositCents) => {
  const totalCents = sumCents(lineItems.map((lineItem) => lineItem.amountCents))

  if (totalCents <= 0) {
    throw createServiceError('The work order total must be greater than zero.')
  }

  if (depositCents < 0) {
    throw createServiceError('The deposit cannot be negative.')
  }

  const roomForDeposit = subtractCents(totalCents, depositCents)

  if (roomForDeposit < 0) {
    throw createServiceError('The deposit cannot be more than the total.')
  }

  return totalCents
}

const lineItemsChanged = (currentLineItems, nextLineItems) => {
  if (currentLineItems.length !== nextLineItems.length) {
    return true
  }

  for (let index = 0; index < currentLineItems.length; index += 1) {
    const currentItem = currentLineItems[index]
    const nextItem = nextLineItems[index]

    if (currentItem.description !== nextItem.description) {
      return true
    }

    if (currentItem.amountCents !== nextItem.amountCents) {
      return true
    }
  }

  return false
}

const serializePayment = (payment) => {
  return {
    id: payment._id.toString(),
    kind: payment.kind,
    method: payment.method,
    amountCents: payment.amountCents,
    status: payment.status,
    note: payment.note || '',
    createdAt: payment.createdAt,
  }
}

const serializeWorkOrder = (workOrder, payments, { includeDetails }) => {
  const billing = deriveBilling(workOrder, payments)
  const succeededPayments = payments.filter((payment) => payment.status === 'succeeded')
  const summary = {
    id: workOrder._id.toString(),
    invoiceCode: workOrder.invoiceCode,
    customerName: workOrder.customerName,
    title: workOrder.title,
    workStatus: workOrder.workStatus,
    paymentStatus: billing.paymentStatus,
    totalCents: billing.totalCents,
    amountPaidCents: billing.amountPaidCents,
    balanceOutstandingCents: billing.balanceOutstandingCents,
    amountDueCents: billing.amountDueCents,
    amountDueKind: billing.amountDueKind,
    createdAt: workOrder.createdAt,
  }

  if (!includeDetails) {
    return summary
  }

  return {
    ...summary,
    customerEmail: workOrder.customerEmail,
    customerPhone: workOrder.customerPhone || '',
    customerAddress: workOrder.customerAddress || '',
    lineItems: workOrder.lineItems.map((lineItem) => ({
      description: lineItem.description,
      amountCents: lineItem.amountCents,
    })),
    depositCents: workOrder.depositCents,
    depositPaidCents: billing.depositPaidCents,
    depositOutstandingCents: billing.depositOutstandingCents,
    contractText: workOrder.contractText || '',
    sentAt: workOrder.sentAt,
    invoiceSentAt: workOrder.invoiceSentAt,
    depositPaidAt: workOrder.depositPaidAt,
    paidAt: workOrder.paidAt,
    completedAt: workOrder.completedAt,
    amountsLocked: Boolean(workOrder.invoiceSentAt),
    depositLocked: succeededPayments.some((payment) => payment.kind === 'deposit'),
    payments: payments.map(serializePayment),
  }
}

const serializePublicInvoice = (
  workOrder,
  payments,
  clientSecret,
  stripeConfigured,
  paymentPending,
) => {
  const billing = deriveBilling(workOrder, payments)

  return {
    invoiceCode: workOrder.invoiceCode,
    customerName: workOrder.customerName,
    customerAddress: workOrder.customerAddress || '',
    title: workOrder.title,
    lineItems: workOrder.lineItems.map((lineItem) => ({
      description: lineItem.description,
      amountCents: lineItem.amountCents,
    })),
    depositCents: workOrder.depositCents,
    contractText: workOrder.contractText || '',
    workStatus: workOrder.workStatus,
    totalCents: billing.totalCents,
    amountPaidCents: billing.amountPaidCents,
    depositOutstandingCents: billing.depositOutstandingCents,
    balanceOutstandingCents: billing.balanceOutstandingCents,
    paymentStatus: billing.paymentStatus,
    amountDueCents: billing.amountDueCents,
    amountDueKind: billing.amountDueKind,
    clientSecret,
    stripeConfigured,
    paymentPending,
  }
}

const loadWorkOrder = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null
  }

  return WorkOrder.findById(id)
}

const loadPayments = async (workOrderId) => {
  return Payment.find({ workOrderId }).sort({ createdAt: 1 })
}

const createUniqueInvoiceCode = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const invoiceCode = generateInvoiceCode()
    const existing = await WorkOrder.findOne({ invoiceCode }).select('_id')

    if (!existing) {
      return invoiceCode
    }
  }

  throw createServiceError('Could not generate an invoice code.', 500)
}

const clearOpenPaymentIntent = async (workOrder) => {
  if (!workOrder.openStripePaymentIntentId) {
    return
  }

  const stripe = getStripeClient()

  if (stripe) {
    try {
      await stripe.paymentIntents.cancel(workOrder.openStripePaymentIntentId)
    } catch {
      // The intent may already be succeeded or canceled.
    }
  }

  workOrder.openStripePaymentIntentId = null
  workOrder.openStripePaymentIntentKind = null
  workOrder.openStripePaymentIntentAmountCents = null
}

const syncWorkOrderAfterPayment = async (workOrderId) => {
  const workOrder = await WorkOrder.findById(workOrderId)
  const payments = await loadPayments(workOrderId)
  const billing = deriveBilling(workOrder, payments)

  const depositSatisfied =
    workOrder.depositCents > 0 &&
    (billing.depositOutstandingCents === 0 || billing.paymentStatus === 'paid')

  if (depositSatisfied && !workOrder.depositPaidAt) {
    workOrder.depositPaidAt = new Date()
  }

  if (billing.paymentStatus === 'paid' && !workOrder.paidAt) {
    workOrder.paidAt = new Date()
  }

  const depositCovered = depositSatisfied

  if (
    depositCovered &&
    (workOrder.workStatus === 'created' || workOrder.workStatus === 'pending')
  ) {
    assertWorkStatusTransition(workOrder.workStatus, 'in_progress')
    workOrder.workStatus = 'in_progress'
  }

  await workOrder.save()

  return { workOrder, payments, billing }
}

const ensurePaymentReceipt = async (payment, workOrder, billing) => {
  if (payment.receiptSentAt) {
    return { sent: true }
  }

  let result

  if (billing.paymentStatus === 'paid') {
    result = await sendPaidInFullEmail({ workOrder, payment, billing })
  } else {
    result = await sendDepositReceivedEmail({ workOrder, payment, billing })
  }

  if (result.sent) {
    payment.receiptSentAt = new Date()
    await payment.save()
  }

  return result
}

const reusableIntentStatus = (status) => {
  return (
    status === 'requires_payment_method' ||
    status === 'requires_confirmation' ||
    status === 'requires_action'
  )
}

const ensurePaymentIntent = async (workOrder, billing) => {
  const stripe = getStripeClient()

  if (!stripe || !billing.amountDueKind || billing.amountDueCents <= 0) {
    return { clientSecret: null, paymentPending: false }
  }

  if (
    workOrder.openStripePaymentIntentId &&
    workOrder.openStripePaymentIntentKind === billing.amountDueKind &&
    workOrder.openStripePaymentIntentAmountCents === billing.amountDueCents
  ) {
    const existingIntent = await stripe.paymentIntents.retrieve(workOrder.openStripePaymentIntentId)

    if (existingIntent.status === 'succeeded') {
      await recordStripePayment(existingIntent)
      return { clientSecret: null, paymentPending: false }
    }

    if (existingIntent.status === 'processing') {
      return { clientSecret: null, paymentPending: true }
    }

    if (reusableIntentStatus(existingIntent.status)) {
      return { clientSecret: existingIntent.client_secret, paymentPending: false }
    }
  }

  const amountCents = assertCents(billing.amountDueCents)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      workOrderId: workOrder._id.toString(),
      invoiceCode: workOrder.invoiceCode,
      kind: billing.amountDueKind,
      amountCents: String(amountCents),
    },
  })

  workOrder.openStripePaymentIntentId = paymentIntent.id
  workOrder.openStripePaymentIntentKind = billing.amountDueKind
  workOrder.openStripePaymentIntentAmountCents = amountCents
  await workOrder.save()

  return { clientSecret: paymentIntent.client_secret, paymentPending: false }
}

const persistDocumentHeading = async (workOrder) => {
  const finalizedContract = applyDocumentHeading(
    workOrder.contractText || '',
    workOrder.invoiceCode,
    workOrder.workStatus,
  )

  if (finalizedContract !== (workOrder.contractText || '')) {
    workOrder.contractText = finalizedContract
    await workOrder.save()
  }

  return workOrder
}

const findWorkOrderByInvoiceCode = async (invoiceCodeInput) => {
  const invoiceCode = normalizeInvoiceCode(invoiceCodeInput)

  if (!isInvoiceCode(invoiceCode)) {
    return null
  }

  return WorkOrder.findOne({ invoiceCode })
}

export const createWorkOrder = async (input) => {
  await connectToDatabase()
  assertChargeShape(input.lineItems, input.depositCents)

  const invoiceCode = await createUniqueInvoiceCode()
  let contractText = applyDocumentHeading(input.contractText.trim(), invoiceCode, 'created')

  if (!contractText) {
    contractText = buildContractText({
      invoiceCode,
      workStatus: 'created',
    })
  }

  const workOrder = await WorkOrder.create({
    invoiceCode,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    customerAddress: input.customerAddress,
    title: input.title,
    lineItems: input.lineItems,
    depositCents: input.depositCents,
    contractText,
    workStatus: 'created',
  })

  return serializeWorkOrder(workOrder, [], { includeDetails: true })
}

export const updateWorkOrder = async (id, input) => {
  await connectToDatabase()
  const workOrder = await loadWorkOrder(id)

  if (!workOrder) {
    return null
  }

  assertChargeShape(input.lineItems, input.depositCents)
  const payments = await loadPayments(workOrder._id)
  const succeededPayments = payments.filter((payment) => payment.status === 'succeeded')
  const lineItemsDidChange = lineItemsChanged(workOrder.lineItems, input.lineItems)
  const depositChanged = input.depositCents !== workOrder.depositCents
  const amountsChanged = lineItemsDidChange || depositChanged
  const depositPaymentExists = succeededPayments.some((payment) => payment.kind === 'deposit')

  if (workOrder.invoiceSentAt && amountsChanged) {
    throw createServiceError('Line items and the deposit are locked after the invoice has been sent.')
  }

  if (depositPaymentExists && depositChanged) {
    throw createServiceError('The deposit is locked after a deposit payment has been recorded.')
  }

  if (amountsChanged) {
    const nextTotalCents = sumCents(input.lineItems.map((lineItem) => lineItem.amountCents))
    const amountPaidCents = sumCents(succeededPayments.map((payment) => payment.amountCents))

    if (subtractCents(nextTotalCents, amountPaidCents) < 0) {
      throw createServiceError('The total cannot be less than the amount already paid.')
    }

    await clearOpenPaymentIntent(workOrder)
  }

  workOrder.customerName = input.customerName
  workOrder.customerEmail = input.customerEmail
  workOrder.customerPhone = input.customerPhone
  workOrder.customerAddress = input.customerAddress
  workOrder.title = input.title
  workOrder.lineItems = input.lineItems
  workOrder.depositCents = input.depositCents
  workOrder.contractText = applyDocumentHeading(
    input.contractText,
    workOrder.invoiceCode,
    workOrder.workStatus,
  )
  await workOrder.save()

  return serializeWorkOrder(workOrder, payments, { includeDetails: true })
}

export const listWorkOrders = async () => {
  await connectToDatabase()
  const workOrders = await WorkOrder.find().sort({ createdAt: -1 })
  const workOrderIds = workOrders.map((workOrder) => workOrder._id)
  const payments = await Payment.find({ workOrderId: { $in: workOrderIds } })
  const paymentsByWorkOrderId = new Map()

  for (const payment of payments) {
    const key = payment.workOrderId.toString()
    const current = paymentsByWorkOrderId.get(key) || []
    current.push(payment)
    paymentsByWorkOrderId.set(key, current)
  }

  return workOrders.map((workOrder) => {
    const workOrderPayments = paymentsByWorkOrderId.get(workOrder._id.toString()) || []

    return serializeWorkOrder(workOrder, workOrderPayments, { includeDetails: false })
  })
}

export const getWorkOrder = async (id) => {
  await connectToDatabase()
  const workOrder = await loadWorkOrder(id)

  if (!workOrder) {
    return null
  }

  const payments = await loadPayments(workOrder._id)
  await persistDocumentHeading(workOrder)

  return serializeWorkOrder(workOrder, payments, { includeDetails: true })
}

export const sendWorkOrder = async (id) => {
  await connectToDatabase()
  const workOrder = await loadWorkOrder(id)

  if (!workOrder) {
    return null
  }

  if (workOrder.workStatus !== 'created' && workOrder.workStatus !== 'pending') {
    throw createServiceError('A quote can be sent again only before work starts.')
  }

  if (workOrder.workStatus === 'created') {
    assertWorkStatusTransition(workOrder.workStatus, 'pending')
    workOrder.workStatus = 'pending'
    workOrder.sentAt = workOrder.sentAt || new Date()
    await workOrder.save()
  }

  await persistDocumentHeading(workOrder)

  let emailResult = { sent: false, reason: 'not attempted' }

  try {
    emailResult = await sendQuoteEmail(workOrder)
  } catch (error) {
    emailResult = { sent: false, reason: error.message }
  }

  const payments = await loadPayments(workOrder._id)

  return {
    workOrder: serializeWorkOrder(workOrder, payments, { includeDetails: true }),
    emailSent: emailResult.sent,
    emailReason: emailResult.reason || '',
  }
}

export const sendWorkOrderInvoice = async (id) => {
  await connectToDatabase()
  const workOrder = await loadWorkOrder(id)

  if (!workOrder) {
    return null
  }

  if (workOrder.workStatus !== 'completed') {
    throw createServiceError('An invoice can be sent after the job is completed.')
  }

  if (!workOrder.invoiceSentAt) {
    workOrder.invoiceSentAt = new Date()
    await workOrder.save()
  }

  await persistDocumentHeading(workOrder)

  const payments = await loadPayments(workOrder._id)
  const billing = deriveBilling(workOrder, payments)
  let emailResult = { sent: false, reason: 'not attempted' }

  try {
    emailResult = await sendInvoiceEmail(workOrder, billing)
  } catch (error) {
    emailResult = { sent: false, reason: error.message }
  }

  return {
    workOrder: serializeWorkOrder(workOrder, payments, { includeDetails: true }),
    emailSent: emailResult.sent,
    emailReason: emailResult.reason || '',
  }
}

export const startWorkOrder = async (id) => {
  await connectToDatabase()
  const workOrder = await loadWorkOrder(id)

  if (!workOrder) {
    return null
  }

  if (workOrder.depositCents !== 0) {
    throw createServiceError('Start work is only used when there is no deposit.')
  }

  if (workOrder.workStatus !== 'pending') {
    throw createServiceError('Work can start after the quote has been sent.')
  }

  assertWorkStatusTransition(workOrder.workStatus, 'in_progress')
  workOrder.workStatus = 'in_progress'
  await workOrder.save()

  const payments = await loadPayments(workOrder._id)

  return serializeWorkOrder(workOrder, payments, { includeDetails: true })
}

export const completeWorkOrder = async (id) => {
  await connectToDatabase()
  const workOrder = await loadWorkOrder(id)

  if (!workOrder) {
    return null
  }

  if (workOrder.workStatus !== 'in_progress') {
    throw createServiceError('Only in-progress work can be marked completed.')
  }

  assertWorkStatusTransition(workOrder.workStatus, 'completed')
  workOrder.workStatus = 'completed'
  workOrder.completedAt = new Date()
  workOrder.contractText = applyDocumentHeading(
    workOrder.contractText || '',
    workOrder.invoiceCode,
    workOrder.workStatus,
  )
  await workOrder.save()

  const payments = await loadPayments(workOrder._id)

  return serializeWorkOrder(workOrder, payments, { includeDetails: true })
}

export const recordManualPayment = async (id, { method, kind, note }) => {
  await connectToDatabase()
  const workOrder = await loadWorkOrder(id)

  if (!workOrder) {
    return null
  }

  const existingPayments = await loadPayments(workOrder._id)
  const billing = deriveBilling(workOrder, existingPayments)
  let amountCents = 0

  if (kind === 'deposit') {
    if (billing.depositOutstandingCents <= 0 || billing.paymentStatus === 'paid') {
      throw createServiceError('This work order has no deposit left to record.')
    }

    amountCents = billing.depositOutstandingCents
  } else if (workOrder.workStatus !== 'completed') {
    throw createServiceError('The balance can be recorded after the job is completed.')
  } else if (billing.balanceOutstandingCents <= 0) {
    throw createServiceError('This work order has no balance left to record.')
  } else {
    amountCents = billing.balanceOutstandingCents
  }

  const payment = await Payment.create({
    workOrderId: workOrder._id,
    kind,
    method,
    amountCents: assertCents(amountCents),
    status: 'succeeded',
    note: note || '',
  })

  const synced = await syncWorkOrderAfterPayment(workOrder._id)
  let emailResult = { sent: false, reason: 'not attempted' }

  try {
    emailResult = await ensurePaymentReceipt(payment, synced.workOrder, synced.billing)
  } catch (error) {
    emailResult = { sent: false, reason: error.message }
  }

  return {
    workOrder: serializeWorkOrder(synced.workOrder, synced.payments, { includeDetails: true }),
    emailSent: emailResult.sent,
    emailReason: emailResult.reason || '',
  }
}

export const recordStripePayment = async (paymentIntent) => {
  await connectToDatabase()
  const workOrderId = paymentIntent.metadata?.workOrderId
  const invoiceCode = normalizeInvoiceCode(paymentIntent.metadata?.invoiceCode || '')
  const kind = paymentIntent.metadata?.kind
  const metadataAmount = Number(paymentIntent.metadata?.amountCents)
  const amountCents = assertCents(paymentIntent.amount)

  if (!workOrderId || !isInvoiceCode(invoiceCode) || !PAYMENT_KINDS.includes(kind)) {
    throw createServiceError('Payment is missing work order details.', 400)
  }

  if (!Number.isSafeInteger(metadataAmount) || metadataAmount !== amountCents) {
    throw createServiceError('Payment amount does not match the charge.', 400)
  }

  const existingPayment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id })

  if (existingPayment) {
    const synced = await syncWorkOrderAfterPayment(existingPayment.workOrderId)

    try {
      await ensurePaymentReceipt(existingPayment, synced.workOrder, synced.billing)
    } catch {
      // A later webhook retry can send the receipt.
    }

    return existingPayment
  }

  const workOrder = await WorkOrder.findById(workOrderId)

  if (!workOrder || workOrder.invoiceCode !== invoiceCode) {
    throw createServiceError('Payment does not match a work order.', 400)
  }

  let payment

  try {
    payment = await Payment.create({
      workOrderId: workOrder._id,
      kind,
      method: 'stripe',
      amountCents,
      status: 'succeeded',
      stripePaymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    if (error.code === 11000) {
      const racedPayment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id })

      if (racedPayment) {
        const synced = await syncWorkOrderAfterPayment(racedPayment.workOrderId)

        try {
          await ensurePaymentReceipt(racedPayment, synced.workOrder, synced.billing)
        } catch {
          // A later webhook retry can send the receipt.
        }
      }

      return racedPayment
    }

    throw error
  }

  if (workOrder.openStripePaymentIntentId === paymentIntent.id) {
    workOrder.openStripePaymentIntentId = null
    workOrder.openStripePaymentIntentKind = null
    workOrder.openStripePaymentIntentAmountCents = null
    await workOrder.save()
  }

  const synced = await syncWorkOrderAfterPayment(workOrder._id)

  try {
    await ensurePaymentReceipt(payment, synced.workOrder, synced.billing)
  } catch {
    // The payment is recorded. A webhook retry sends the receipt if receiptSentAt is empty.
  }

  return payment
}

export const getPublicInvoice = async (invoiceCodeInput) => {
  await connectToDatabase()
  const workOrder = await findWorkOrderByInvoiceCode(invoiceCodeInput)

  if (!workOrder) {
    throw createServiceError(INVOICE_NOT_FOUND_MESSAGE, 404)
  }

  let payments = await loadPayments(workOrder._id)
  let billing = deriveBilling(workOrder, payments)
  const stripe = getStripeClient()
  let clientSecret = null
  let paymentPending = false

  if (stripe && billing.amountDueCents > 0) {
    const intentResult = await ensurePaymentIntent(workOrder, billing)
    clientSecret = intentResult.clientSecret
    paymentPending = intentResult.paymentPending

    if (!clientSecret && !paymentPending) {
      const refreshed = await WorkOrder.findById(workOrder._id)
      payments = await loadPayments(workOrder._id)
      billing = deriveBilling(refreshed, payments)

      if (billing.amountDueCents > 0) {
        const refreshedIntent = await ensurePaymentIntent(refreshed, billing)
        clientSecret = refreshedIntent.clientSecret
        paymentPending = refreshedIntent.paymentPending
      }
    }
  }

  const currentWorkOrder = await WorkOrder.findById(workOrder._id)
  payments = await loadPayments(workOrder._id)
  await persistDocumentHeading(currentWorkOrder)

  return serializePublicInvoice(
    currentWorkOrder,
    payments,
    clientSecret,
    Boolean(stripe),
    paymentPending,
  )
}

export const confirmPublicPayment = async (invoiceCodeInput, paymentIntentId) => {
  await connectToDatabase()
  const workOrder = await findWorkOrderByInvoiceCode(invoiceCodeInput)

  if (!workOrder) {
    throw createServiceError(INVOICE_NOT_FOUND_MESSAGE, 404)
  }

  const stripe = getStripeClient()

  if (!stripe) {
    throw createServiceError('Card payments are not configured.', 503)
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  const intentInvoiceCode = normalizeInvoiceCode(paymentIntent.metadata?.invoiceCode || '')

  if (intentInvoiceCode !== workOrder.invoiceCode) {
    throw createServiceError(INVOICE_NOT_FOUND_MESSAGE, 404)
  }

  if (paymentIntent.status === 'succeeded') {
    await recordStripePayment(paymentIntent)
  }

  const publicInvoice = await getPublicInvoice(workOrder.invoiceCode)

  return {
    paymentIntentStatus: paymentIntent.status,
    invoice: publicInvoice,
  }
}
