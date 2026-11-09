'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { isInvoiceCode, normalizeInvoiceCode } from '@/lib/billing/invoiceCode'

export const PayLookupPage = () => {
  const router = useRouter()
  const [invoiceCode, setInvoiceCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const normalizedInvoiceCode = normalizeInvoiceCode(invoiceCode)

    if (!isInvoiceCode(normalizedInvoiceCode)) {
      setErrorMessage('Enter the code from your quote or invoice. It looks like BMT-7K3Q9M2P.')
      return
    }

    router.push(`/pay/${normalizedInvoiceCode}`)
  }

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit}>
      <Stack spacing={1}>
        <Typography component="h1" variant="h2">
          Pay an invoice
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter the code from your quote or invoice. It looks like BMT-7K3Q9M2P.
        </Typography>
      </Stack>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      <TextField
        label="Quote or invoice code"
        value={invoiceCode}
        onChange={(event) => setInvoiceCode(event.target.value)}
        required
        fullWidth
        autoComplete="off"
      />
      <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
        Search
      </Button>
    </Stack>
  )
}
