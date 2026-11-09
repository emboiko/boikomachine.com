'use client'

import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { WorkOrderForm } from '@/components/admin/WorkOrderForm'
import {
  PAYMENT_KIND_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  WORK_STATUS_LABELS,
} from '@/lib/billing/statuses'
import { formatCents } from '@/lib/money'
import {
  completeAdminWorkOrder,
  fetchAdminWorkOrder,
  recordAdminWorkOrderPayment,
  sendAdminWorkOrder,
  sendAdminWorkOrderInvoice,
  startAdminWorkOrder,
  updateAdminWorkOrder,
} from '@/services/client/adminWorkOrderClientService'

const readEmailNotice = (result, successMessage) => {
  if (result.emailSent) {
    return { message: successMessage, severity: 'success' }
  }

  if (result.emailReason) {
    return {
      message: `The work order was updated, but the email was not sent. ${result.emailReason}`,
      severity: 'warning',
    }
  }

  return {
    message: 'The work order was updated, but the email was not sent.',
    severity: 'warning',
  }
}

export const AdminWorkOrderEditPage = ({ workOrderId }) => {
  const [workOrder, setWorkOrder] = useState(null)
  const [formKey, setFormKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [noticeMessage, setNoticeMessage] = useState('')
  const [noticeSeverity, setNoticeSeverity] = useState('success')
  const [paymentNote, setPaymentNote] = useState('')
  const [isActing, setIsActing] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const loadWorkOrder = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const nextWorkOrder = await fetchAdminWorkOrder(workOrderId)

        if (!isCancelled) {
          setWorkOrder(nextWorkOrder)
          setFormKey((currentKey) => currentKey + 1)
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error.message || 'Failed to load the work order.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadWorkOrder()

    return () => {
      isCancelled = true
    }
  }, [workOrderId])

  const replaceWorkOrder = (nextWorkOrder) => {
    setWorkOrder(nextWorkOrder)
    setFormKey((currentKey) => currentKey + 1)
  }

  const handleSubmit = async (payload) => {
    const updatedWorkOrder = await updateAdminWorkOrder(workOrderId, payload)
    replaceWorkOrder(updatedWorkOrder)
    setNoticeMessage('Work order saved.')
    setNoticeSeverity('success')
    setErrorMessage('')
  }

  const runAction = async (action) => {
    setIsActing(true)
    setErrorMessage('')
    setNoticeMessage('')

    try {
      await action()
    } catch (error) {
      setErrorMessage(error.message || 'That action failed.')
    } finally {
      setIsActing(false)
    }
  }

  const handleSend = () => {
    return runAction(async () => {
      const result = await sendAdminWorkOrder(workOrderId)
      const notice = readEmailNotice(result, 'Quote email sent.')
      replaceWorkOrder(result.workOrder)
      setNoticeMessage(notice.message)
      setNoticeSeverity(notice.severity)
    })
  }

  const handleSendInvoice = () => {
    return runAction(async () => {
      const result = await sendAdminWorkOrderInvoice(workOrderId)
      const notice = readEmailNotice(result, 'Invoice email sent.')
      replaceWorkOrder(result.workOrder)
      setNoticeMessage(notice.message)
      setNoticeSeverity(notice.severity)
    })
  }

  const handleStart = () => {
    return runAction(async () => {
      const result = await startAdminWorkOrder(workOrderId)
      replaceWorkOrder(result.workOrder)
      setNoticeMessage('Work marked in progress.')
      setNoticeSeverity('success')
    })
  }

  const handleComplete = () => {
    return runAction(async () => {
      const result = await completeAdminWorkOrder(workOrderId)
      replaceWorkOrder(result.workOrder)
      setNoticeMessage('Work marked completed.')
      setNoticeSeverity('success')
    })
  }

  const handleRecordPayment = (method, kind) => {
    return runAction(async () => {
      const result = await recordAdminWorkOrderPayment(workOrderId, {
        method,
        kind,
        note: paymentNote,
      })
      const methodLabel = PAYMENT_METHOD_LABELS[method] || method
      let kindLabel = 'balance'

      if (kind === 'deposit') {
        kindLabel = 'deposit'
      }

      const notice = readEmailNotice(result, `${methodLabel} ${kindLabel} recorded.`)
      replaceWorkOrder(result.workOrder)
      setPaymentNote('')
      setNoticeMessage(notice.message)
      setNoticeSeverity(notice.severity)
    })
  }

  const canSendQuote = Boolean(
    workOrder && (workOrder.workStatus === 'created' || workOrder.workStatus === 'pending'),
  )
  const canSendInvoice = Boolean(workOrder && workOrder.workStatus === 'completed')
  const canRecordDeposit = Boolean(
    workOrder && workOrder.depositOutstandingCents > 0 && workOrder.paymentStatus !== 'paid',
  )
  const canRecordBalance = Boolean(
    workOrder && workOrder.workStatus === 'completed' && workOrder.balanceOutstandingCents > 0,
  )
  const canStartWork = Boolean(
    workOrder && workOrder.workStatus === 'pending' && workOrder.depositOutstandingCents === 0,
  )
  const canComplete = Boolean(workOrder && workOrder.workStatus === 'in_progress')
  let quoteButtonLabel = 'Resend quote'
  let quoteButtonVariant = 'outlined'
  let invoiceButtonLabel = 'Send invoice'
  let invoiceButtonVariant = 'contained'
  let printLabel = 'Print quote'

  if (workOrder && workOrder.workStatus === 'created') {
    quoteButtonLabel = 'Send quote (Move job to pending)'
    quoteButtonVariant = 'contained'
  }

  if (workOrder && workOrder.invoiceSentAt) {
    invoiceButtonLabel = 'Resend invoice'
    invoiceButtonVariant = 'outlined'
  }

  if (workOrder && workOrder.workStatus === 'completed') {
    printLabel = 'Print invoice'
  }

  return (
    <AdminShell title="Work order" backHref="/admin/work-orders" backLabel="Work orders">
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {noticeMessage ? <Alert severity={noticeSeverity}>{noticeMessage}</Alert> : null}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!isLoading && workOrder ? (
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              {workOrder.invoiceCode}
            </Typography>
            <Typography variant="body1">
              {WORK_STATUS_LABELS[workOrder.workStatus]} ·{' '}
              {PAYMENT_STATUS_LABELS[workOrder.paymentStatus]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total {formatCents(workOrder.totalCents)} · Deposit{' '}
              {formatCents(workOrder.depositCents)} · Paid {formatCents(workOrder.amountPaidCents)}{' '}
              · Balance {formatCents(workOrder.balanceOutstandingCents)}
            </Typography>
          </Stack>

          <WorkOrderForm
            key={formKey}
            initialWorkOrder={workOrder}
            onSubmit={handleSubmit}
            amountsLocked={workOrder.amountsLocked}
            depositLocked={workOrder.depositLocked}
          />

          <Divider />

          <Stack spacing={2}>
            <Typography variant="h3" sx={{ fontSize: '1.125rem' }}>
              Actions
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {canSendQuote ? (
                <Button variant={quoteButtonVariant} onClick={handleSend} disabled={isActing}>
                  {quoteButtonLabel}
                </Button>
              ) : null}
              {canStartWork ? (
                <Button variant="outlined" onClick={handleStart} disabled={isActing}>
                  Start work (Move job to in progress)
                </Button>
              ) : null}
              {canComplete ? (
                <Button variant="outlined" onClick={handleComplete} disabled={isActing}>
                  Mark completed
                </Button>
              ) : null}
              {canSendInvoice ? (
                <Button
                  variant={invoiceButtonVariant}
                  onClick={handleSendInvoice}
                  disabled={isActing}
                >
                  {invoiceButtonLabel}
                </Button>
              ) : null}
              <Button
                component={Link}
                href={`/admin/work-orders/${workOrder.id}/print`}
                variant="outlined"
                target="_blank"
              >
                {printLabel}
              </Button>
            </Stack>
          </Stack>

          <Divider />

          {canRecordDeposit || canRecordBalance ? (
            <Stack spacing={3}>
              {canRecordDeposit ? (
                <Stack spacing={1}>
                  <Typography variant="h3" sx={{ fontSize: '1.125rem' }}>
                    Record deposit
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Records {formatCents(workOrder.depositOutstandingCents)} as a check or cash
                    deposit.
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      variant="contained"
                      onClick={() => handleRecordPayment('check', 'deposit')}
                      disabled={isActing}
                    >
                      Record deposit check
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleRecordPayment('cash', 'deposit')}
                      disabled={isActing}
                    >
                      Record deposit cash
                    </Button>
                  </Stack>
                </Stack>
              ) : null}
              {canRecordBalance ? (
                <Stack spacing={1}>
                  <Typography variant="h3" sx={{ fontSize: '1.125rem' }}>
                    Mark as Paid
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Records {formatCents(workOrder.balanceOutstandingCents)} as paid. The balance
                    becomes {formatCents(0)}.
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      variant="contained"
                      onClick={() => handleRecordPayment('check', 'balance')}
                      disabled={isActing}
                    >
                      Mark as Paid - Check
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleRecordPayment('cash', 'balance')}
                      disabled={isActing}
                    >
                      Mark as Paid - Cash
                    </Button>
                  </Stack>
                </Stack>
              ) : null}
              <TextField
                label="Note"
                value={paymentNote}
                onChange={(event) => setPaymentNote(event.target.value)}
                fullWidth
                placeholder="Check number, or who took the cash"
              />
            </Stack>
          ) : null}

          <Stack spacing={1}>
            <Typography variant="h3" sx={{ fontSize: '1.125rem' }}>
              Payments
            </Typography>
            {workOrder.payments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No payments yet.
              </Typography>
            ) : (
              workOrder.payments.map((payment) => (
                <Typography key={payment.id} variant="body2">
                  {new Date(payment.createdAt).toLocaleDateString()} ·{' '}
                  {PAYMENT_KIND_LABELS[payment.kind]} · {PAYMENT_METHOD_LABELS[payment.method]} ·{' '}
                  {formatCents(payment.amountCents)}
                  {payment.note ? ` · ${payment.note}` : ''}
                </Typography>
              ))
            )}
          </Stack>
        </Stack>
      ) : null}
    </AdminShell>
  )
}
