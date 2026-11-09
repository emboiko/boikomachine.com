'use client'

import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

export const PaymentForm = ({ invoiceCode, payLabel, onPaid, returnPath }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    let returnUrl = `${window.location.origin}/pay/${invoiceCode}`

    if (returnPath) {
      returnUrl = `${window.location.origin}${returnPath}`
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: 'if_required',
    })

    if (result.error) {
      setErrorMessage(result.error.message || 'Payment failed.')
      setIsSubmitting(false)
      return
    }

    if (!result.paymentIntent) {
      setErrorMessage('Payment could not be confirmed.')
      setIsSubmitting(false)
      return
    }

    try {
      await onPaid(result.paymentIntent.id)
    } catch (error) {
      setErrorMessage(error.message || 'The payment went through, but the page could not be refreshed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  let buttonLabel = payLabel

  if (isSubmitting) {
    buttonLabel = 'Processing…'
  }

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      <PaymentElement />
      <Button type="submit" variant="contained" disabled={!stripe || isSubmitting} sx={{ alignSelf: 'flex-start' }}>
        {buttonLabel}
      </Button>
    </Stack>
  )
}
