import { subtractCents, sumCents } from '@/lib/money'

const sumSucceededAmounts = (payments, kind) => {
  const amounts = []

  for (const payment of payments) {
    if (payment.status !== 'succeeded') {
      continue
    }

    if (kind && payment.kind !== kind) {
      continue
    }

    amounts.push(payment.amountCents)
  }

  return sumCents(amounts)
}

const positiveDifference = (leftCents, rightCents) => {
  const difference = subtractCents(leftCents, rightCents)

  if (difference > 0) {
    return difference
  }

  return 0
}

export const deriveBilling = (workOrder, payments) => {
  const totalCents = sumCents(workOrder.lineItems.map((lineItem) => lineItem.amountCents))
  const amountPaidCents = sumSucceededAmounts(payments)
  const depositPaidCents = sumSucceededAmounts(payments, 'deposit')
  let depositOutstandingCents = 0

  if (workOrder.depositCents > 0) {
    depositOutstandingCents = positiveDifference(workOrder.depositCents, depositPaidCents)
  }

  const balanceOutstandingCents = positiveDifference(totalCents, amountPaidCents)

  let paymentStatus = 'unpaid'

  if (balanceOutstandingCents === 0) {
    paymentStatus = 'paid'
  } else if (workOrder.depositCents > 0 && depositOutstandingCents === 0) {
    paymentStatus = 'deposit_paid'
  }

  let amountDueKind = null
  let amountDueCents = 0

  if (depositOutstandingCents > 0) {
    amountDueKind = 'deposit'
    amountDueCents = depositOutstandingCents
  } else if (balanceOutstandingCents > 0 && workOrder.workStatus === 'completed') {
    amountDueKind = 'balance'
    amountDueCents = balanceOutstandingCents
  }

  return {
    totalCents,
    amountPaidCents,
    depositPaidCents,
    depositOutstandingCents,
    balanceOutstandingCents,
    paymentStatus,
    amountDueKind,
    amountDueCents,
  }
}
