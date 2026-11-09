'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PaymentForm } from '@/components/pay/PaymentForm'
import { documentLabelForWorkStatus, PAYMENT_STATUS_LABELS } from '@/lib/billing/statuses'
import { formatCents } from '@/lib/money'
import { confirmPayPayment, fetchPayInvoice } from '@/services/client/payClientService'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

export const PayInvoicePage = ({ invoiceCode, stage = 'invoice' }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get('payment_intent') || ''
  const redirectStatus = searchParams.get('redirect_status') || ''
  const [invoice, setInvoice] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [noticeMessage, setNoticeMessage] = useState('')

  useEffect(() => {
    let isCancelled = false

    const loadInvoice = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        if (paymentIntentId && redirectStatus === 'failed') {
          const nextInvoice = await fetchPayInvoice(invoiceCode)

          if (!isCancelled) {
            setInvoice(nextInvoice)
            setErrorMessage('The bank did not complete the payment.')
          }

          return
        }

        if (paymentIntentId) {
          const result = await confirmPayPayment(invoiceCode, paymentIntentId)

          if (!isCancelled) {
            setInvoice(result.invoice)

            if (result.paymentIntentStatus === 'succeeded') {
              setNoticeMessage('Payment received.')
            } else if (result.paymentIntentStatus === 'processing') {
              setNoticeMessage('The payment is processing.')
            }
          }

          return
        }

        const nextInvoice = await fetchPayInvoice(invoiceCode)

        if (!isCancelled) {
          setInvoice(nextInvoice)
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error.message || "We couldn't find a quote or invoice with that code.")
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadInvoice()

    return () => {
      isCancelled = true
    }
  }, [invoiceCode, paymentIntentId, redirectStatus])

  useEffect(() => {
    if (!invoice) {
      return
    }

    let nextPath = ''

    if (stage === 'quote' && invoice.workStatus === 'completed') {
      nextPath = `/pay/${invoice.invoiceCode}`
    } else if (stage === 'invoice' && invoice.workStatus !== 'completed') {
      nextPath = `/quote/${invoice.invoiceCode}`
    }

    if (!nextPath) {
      return
    }

    const nextParams = new URLSearchParams()

    if (paymentIntentId) {
      nextParams.set('payment_intent', paymentIntentId)
    }

    if (redirectStatus) {
      nextParams.set('redirect_status', redirectStatus)
    }

    const nextQuery = nextParams.toString()

    if (nextQuery) {
      nextPath = `${nextPath}?${nextQuery}`
    }

    router.replace(nextPath)
  }, [invoice, paymentIntentId, redirectStatus, router, stage])

  const handlePaid = async (confirmedPaymentIntentId) => {
    const result = await confirmPayPayment(invoiceCode, confirmedPaymentIntentId)
    setInvoice(result.invoice)

    if (result.paymentIntentStatus === 'succeeded') {
      setNoticeMessage('Payment received.')
      setErrorMessage('')
      return
    }

    if (result.paymentIntentStatus === 'processing') {
      setNoticeMessage('The payment is processing.')
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!invoice) {
    return <Alert severity="error">{errorMessage || "We couldn't find a quote or invoice with that code."}</Alert>
  }

  const isQuote = invoice.workStatus !== 'completed'
  let stageMismatch = false

  if (stage === 'quote' && !isQuote) {
    stageMismatch = true
  }

  if (stage === 'invoice' && isQuote) {
    stageMismatch = true
  }

  if (stageMismatch) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  const documentLabel = documentLabelForWorkStatus(invoice.workStatus)
  let paidMessage = 'This quote is paid in full.'
  let pendingMessage = 'A payment is already processing for this quote.'
  let offlineMessage =
    'Card payment is not available right now. You can still pay by check or cash using the instructions on your quote.'

  if (invoice.workStatus === 'completed') {
    paidMessage = 'This invoice is paid in full.'
    pendingMessage = 'A payment is already processing for this invoice.'
    offlineMessage =
      'Card payment is not available right now. You can still pay by check or cash using the instructions on your invoice.'
  }

  const showBalanceLater = Boolean(
    invoice.workStatus !== 'completed' &&
      invoice.balanceOutstandingCents > 0 &&
      invoice.amountDueCents === 0,
  )
  let dueLabel = 'Amount due'

  if (invoice.amountDueKind === 'deposit') {
    dueLabel = 'Deposit due'
  } else if (invoice.amountDueKind === 'balance') {
    dueLabel = 'Balance due'
  }

  let payLabel = `Pay ${formatCents(invoice.amountDueCents)}`

  if (invoice.amountDueKind === 'deposit') {
    payLabel = `Pay deposit ${formatCents(invoice.amountDueCents)}`
  } else if (invoice.amountDueKind === 'balance') {
    payLabel = `Pay balance ${formatCents(invoice.amountDueCents)}`
  }

  let canPayOnThisPage = invoice.amountDueCents > 0

  if (stage === 'quote' && invoice.amountDueKind !== 'deposit') {
    canPayOnThisPage = false
  }

  const showPaymentForm = Boolean(
    stripePromise && invoice.clientSecret && canPayOnThisPage && !invoice.paymentPending,
  )
  let returnPath = `/pay/${invoice.invoiceCode}`

  if (stage === 'quote') {
    returnPath = `/quote/${invoice.invoiceCode}`
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography component="h1" variant="h2">
          {invoice.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {documentLabel} {invoice.invoiceCode} · {invoice.customerName} ·{' '}
          {PAYMENT_STATUS_LABELS[invoice.paymentStatus]}
        </Typography>
      </Stack>

      {noticeMessage ? <Alert severity="success">{noticeMessage}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack spacing={1}>
        {invoice.lineItems.map((lineItem, index) => (
          <Stack
            key={`${index}-${lineItem.description}`}
            direction="row"
            spacing={2}
            sx={{ justifyContent: 'space-between' }}
          >
            <Typography variant="body2">{lineItem.description}</Typography>
            <Typography variant="body2">{formatCents(lineItem.amountCents)}</Typography>
          </Stack>
        ))}
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="body2">Total {formatCents(invoice.totalCents)}</Typography>
        <Typography variant="body2">Deposit {formatCents(invoice.depositCents)}</Typography>
        <Typography variant="body2">Paid {formatCents(invoice.amountPaidCents)}</Typography>
        <Typography variant="body2">Balance {formatCents(invoice.balanceOutstandingCents)}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 700 }}>
          {dueLabel} {formatCents(invoice.amountDueCents)}
        </Typography>
      </Stack>

      <Divider />

      {invoice.paymentStatus === 'paid' ? <Alert severity="success">{paidMessage}</Alert> : null}

      {showBalanceLater ? (
        <Alert severity="info">The remaining balance is due when the job is finished.</Alert>
      ) : null}

      {invoice.paymentPending ? <Alert severity="info">{pendingMessage}</Alert> : null}

      {invoice.amountDueCents > 0 && !invoice.stripeConfigured ? (
        <Alert severity="info">{offlineMessage}</Alert>
      ) : null}

      {showPaymentForm ? (
        <Elements
          key={invoice.clientSecret}
          stripe={stripePromise}
          options={{ clientSecret: invoice.clientSecret }}
        >
          <PaymentForm
            invoiceCode={invoice.invoiceCode}
            payLabel={payLabel}
            returnPath={returnPath}
            onPaid={handlePaid}
          />
        </Elements>
      ) : null}

      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }} color="text.secondary">
        {invoice.contractText}
      </Typography>
    </Stack>
  )
}
