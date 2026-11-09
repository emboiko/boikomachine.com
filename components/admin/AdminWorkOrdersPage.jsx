'use client'

import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { WorkOrderList } from '@/components/admin/WorkOrderList'
import { fetchAdminWorkOrders } from '@/services/client/adminWorkOrderClientService'

export const AdminWorkOrdersPage = () => {
  const [workOrders, setWorkOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isCancelled = false

    const loadWorkOrders = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const nextWorkOrders = await fetchAdminWorkOrders()

        if (!isCancelled) {
          setWorkOrders(nextWorkOrders)
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error.message || 'Failed to load work orders.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadWorkOrders()

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <AdminShell title="Work orders" backHref="/admin" backLabel="Admin home">
      <Stack spacing={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Send a quote, then an invoice when the job is finished. Record card, check, or cash
            payments.
          </Typography>
          <Button component={Link} href="/admin/work-orders/new" variant="contained">
            New work order
          </Button>
        </Box>

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <WorkOrderList workOrders={workOrders} />
        )}
      </Stack>
    </AdminShell>
  )
}
