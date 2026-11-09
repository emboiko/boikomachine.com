export const WORK_STATUSES = ['created', 'pending', 'in_progress', 'completed']

export const BILLING_PAYMENT_STATUSES = ['unpaid', 'deposit_paid', 'paid']

export const PAYMENT_KINDS = ['deposit', 'balance']

export const PAYMENT_METHODS = ['stripe', 'check', 'cash']

export const WORK_STATUS_LABELS = {
  created: 'Created',
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
}

export const PAYMENT_STATUS_LABELS = {
  unpaid: 'Unpaid',
  deposit_paid: 'Deposit paid',
  paid: 'Paid',
}

export const PAYMENT_KIND_LABELS = {
  deposit: 'Deposit',
  balance: 'Balance',
}

export const PAYMENT_METHOD_LABELS = {
  stripe: 'Card',
  check: 'Check',
  cash: 'Cash',
}

export const documentLabelForWorkStatus = (workStatus) => {
  if (workStatus === 'completed') {
    return 'Invoice'
  }

  return 'Quote'
}
