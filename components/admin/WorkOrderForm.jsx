'use client'

import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { buildContractText } from '@/lib/billing/contractTemplate'
import { centsToDollarInput, dollarsToCents } from '@/lib/money'

const emptyLineItem = (description = '') => {
  return { description, amount: '' }
}

const buildInitialState = (initialWorkOrder) => {
  if (initialWorkOrder) {
    return {
      customerName: initialWorkOrder.customerName,
      customerEmail: initialWorkOrder.customerEmail,
      customerPhone: initialWorkOrder.customerPhone || '',
      customerAddress: initialWorkOrder.customerAddress || '',
      title: initialWorkOrder.title,
      lineItems: initialWorkOrder.lineItems.map((lineItem) => ({
        description: lineItem.description,
        amount: centsToDollarInput(lineItem.amountCents),
      })),
      depositAmount: centsToDollarInput(initialWorkOrder.depositCents),
      contractText: initialWorkOrder.contractText || '',
    }
  }

  return {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    title: '',
    lineItems: [emptyLineItem('Labor & Machining')],
    depositAmount: '0.00',
    contractText: '',
  }
}

const readLineItems = (lineItems) => {
  return lineItems.map((lineItem) => ({
    description: lineItem.description.trim(),
    amountCents: dollarsToCents(lineItem.amount),
  }))
}

export const WorkOrderForm = ({
  initialWorkOrder,
  onSubmit,
  amountsLocked = false,
  depositLocked = false,
}) => {
  const [formState, setFormState] = useState(() => buildInitialState(initialWorkOrder))
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isCreateMode = !initialWorkOrder

  const updateField = (field, value) => {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }))
  }

  const updateLineItem = (index, field, value) => {
    setFormState((currentState) => ({
      ...currentState,
      lineItems: currentState.lineItems.map((lineItem, lineIndex) => {
        if (lineIndex !== index) {
          return lineItem
        }

        return {
          ...lineItem,
          [field]: value,
        }
      }),
    }))
  }

  const addLineItem = () => {
    setFormState((currentState) => ({
      ...currentState,
      lineItems: [...currentState.lineItems, emptyLineItem()],
    }))
  }

  const removeLineItem = (index) => {
    setFormState((currentState) => {
      if (currentState.lineItems.length === 1) {
        return currentState
      }

      return {
        ...currentState,
        lineItems: currentState.lineItems.filter((_, lineIndex) => lineIndex !== index),
      }
    })
  }

  const handleRefreshContract = () => {
    const contractText = buildContractText({
      invoiceCode: initialWorkOrder?.invoiceCode || '',
      workStatus: initialWorkOrder?.workStatus || 'created',
    })

    updateField('contractText', contractText)
    setErrorMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const payload = {
        customerName: formState.customerName.trim(),
        customerEmail: formState.customerEmail.trim(),
        customerPhone: formState.customerPhone.trim(),
        customerAddress: formState.customerAddress.trim(),
        title: formState.title.trim(),
        lineItems: readLineItems(formState.lineItems),
        depositCents: dollarsToCents(formState.depositAmount),
        contractText: formState.contractText,
      }

      await onSubmit(payload)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save the work order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  let submitLabel = 'Create work order'
  const isDepositFieldLocked = amountsLocked || depositLocked
  let contractHelperText =
    'Payment terms sent with the quote or invoice. The customer, scope, and price are already printed above this.'

  if (isCreateMode) {
    contractHelperText =
      'Leave this blank to generate payment terms when you save. Refresh fills a preview you can edit.'
  }

  if (initialWorkOrder) {
    submitLabel = 'Save changes'
  }

  if (isSubmitting) {
    submitLabel = 'Saving…'
  }

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {amountsLocked ? (
        <Alert severity="info">
          Line items and the deposit are locked because the invoice has been sent.
        </Alert>
      ) : null}
      {!amountsLocked && depositLocked ? (
        <Alert severity="info">
          The deposit is locked because a deposit payment has been recorded. Line items can still
          be updated until the invoice is sent.
        </Alert>
      ) : null}

      <TextField
        label="Customer name"
        value={formState.customerName}
        onChange={(event) => updateField('customerName', event.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Customer email"
        type="email"
        value={formState.customerEmail}
        onChange={(event) => updateField('customerEmail', event.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Customer phone"
        value={formState.customerPhone}
        onChange={(event) => updateField('customerPhone', event.target.value)}
        fullWidth
      />
      <TextField
        label="Mailing address"
        value={formState.customerAddress}
        onChange={(event) => updateField('customerAddress', event.target.value)}
        fullWidth
        multiline
        minRows={2}
        helperText="Printed on the quote or invoice that goes in the envelope."
      />
      <TextField
        label="Job title"
        value={formState.title}
        onChange={(event) => updateField('title', event.target.value)}
        required
        fullWidth
      />

      <Stack spacing={2}>
        <Typography variant="h3" sx={{ fontSize: '1.125rem' }}>
          Line items
        </Typography>
        {formState.lineItems.map((lineItem, index) => (
          <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              label="Description"
              value={lineItem.description}
              onChange={(event) => updateLineItem(index, 'description', event.target.value)}
              required
              fullWidth
              disabled={amountsLocked}
            />
            <TextField
              label="Amount"
              value={lineItem.amount}
              onChange={(event) => updateLineItem(index, 'amount', event.target.value)}
              required
              sx={{ width: { xs: '100%', sm: 160 } }}
              disabled={amountsLocked}
              placeholder="0.00"
            />
            <Button
              type="button"
              variant="text"
              color="inherit"
              onClick={() => removeLineItem(index)}
              disabled={amountsLocked || formState.lineItems.length === 1}
            >
              Remove
            </Button>
          </Stack>
        ))}
        <Box>
          <Button type="button" variant="outlined" onClick={addLineItem} disabled={amountsLocked}>
            Add line
          </Button>
        </Box>
      </Stack>

      <TextField
        label="Deposit"
        value={formState.depositAmount}
        onChange={(event) => updateField('depositAmount', event.target.value)}
        required
        fullWidth
        disabled={isDepositFieldLocked}
        helperText="Due before work starts. Use 0.00 if the customer will pay the full amount at once."
      />

      <TextField
        label="Contract"
        value={formState.contractText}
        onChange={(event) => updateField('contractText', event.target.value)}
        fullWidth
        multiline
        minRows={12}
        helperText={contractHelperText}
      />
      <Box>
        <Button type="button" variant="outlined" onClick={handleRefreshContract}>
          Refresh from template
        </Button>
      </Box>

      <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ alignSelf: 'flex-start' }}>
        {submitLabel}
      </Button>
    </Stack>
  )
}
