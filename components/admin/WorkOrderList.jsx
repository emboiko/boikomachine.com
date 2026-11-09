'use client'

import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import {
  BILLING_PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  WORK_STATUSES,
  WORK_STATUS_LABELS,
} from '@/lib/billing/statuses'
import { formatCents } from '@/lib/money'

export const WorkOrderList = ({ workOrders }) => {
  const [workStatusFilter, setWorkStatusFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((workOrder) => {
      if (workStatusFilter !== 'all' && workOrder.workStatus !== workStatusFilter) {
        return false
      }

      if (paymentStatusFilter !== 'all' && workOrder.paymentStatus !== paymentStatusFilter) {
        return false
      }

      return true
    })
  }, [paymentStatusFilter, workOrders, workStatusFilter])

  if (workOrders.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No work orders yet. Create the first one to send a quote.
      </Typography>
    )
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="work-order-status-filter-label">Job status</InputLabel>
          <Select
            labelId="work-order-status-filter-label"
            label="Job status"
            value={workStatusFilter}
            onChange={(event) => setWorkStatusFilter(event.target.value)}
          >
            <MenuItem value="all">All job statuses</MenuItem>
            {WORK_STATUSES.map((workStatus) => (
              <MenuItem key={workStatus} value={workStatus}>
                {WORK_STATUS_LABELS[workStatus]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="work-order-payment-filter-label">Payment status</InputLabel>
          <Select
            labelId="work-order-payment-filter-label"
            label="Payment status"
            value={paymentStatusFilter}
            onChange={(event) => setPaymentStatusFilter(event.target.value)}
          >
            <MenuItem value="all">All payment statuses</MenuItem>
            {BILLING_PAYMENT_STATUSES.map((paymentStatus) => (
              <MenuItem key={paymentStatus} value={paymentStatus}>
                {PAYMENT_STATUS_LABELS[paymentStatus]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {filteredWorkOrders.length === 0 ? (
        <Alert severity="info">No work orders match these filters.</Alert>
      ) : (
        <Stack spacing={2}>
          {filteredWorkOrders.map((workOrder) => (
            <Card key={workOrder.id} variant="outlined">
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ sm: 'center' }}
                >
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="overline" color="text.secondary">
                      {workOrder.invoiceCode}
                    </Typography>
                    <Typography variant="h3" sx={{ fontSize: '1.125rem', mb: 0.5 }}>
                      {workOrder.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {workOrder.customerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {WORK_STATUS_LABELS[workOrder.workStatus]} ·{' '}
                      {PAYMENT_STATUS_LABELS[workOrder.paymentStatus]} · Balance{' '}
                      {formatCents(workOrder.balanceOutstandingCents)}
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    href={`/admin/work-orders/${workOrder.id}`}
                    variant="outlined"
                  >
                    Open
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
