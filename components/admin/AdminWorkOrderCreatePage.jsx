'use client'

import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { WorkOrderForm } from '@/components/admin/WorkOrderForm'
import { fetchAdminInquiry } from '@/services/client/adminInquiryClientService'
import { createAdminWorkOrder } from '@/services/client/adminWorkOrderClientService'
import { buildQuoteTitle } from '@/lib/shopAssistant/quoteTitle'

export const AdminWorkOrderCreatePage = ({ inquiryId = '' }) => {
  const router = useRouter()
  const [initialValues, setInitialValues] = useState(null)
  const [linkedInquiryId, setLinkedInquiryId] = useState('')
  const [existingWorkOrderId, setExistingWorkOrderId] = useState('')
  const [notice, setNotice] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(inquiryId))

  useEffect(() => {
    if (!inquiryId) {
      return undefined
    }

    let isCancelled = false
    setIsLoading(true)

    const loadInquiry = async () => {
      try {
        const inquiry = await fetchAdminInquiry(inquiryId)

        if (isCancelled) {
          return
        }

        if (inquiry.workOrderId) {
          setExistingWorkOrderId(inquiry.workOrderId)
          setNotice('This inquiry already has a work order.')
          return
        }

        if (inquiry.status !== 'accepted') {
          setNotice('Accept the inquiry before writing a quote from it.')
          return
        }

        setInitialValues({
          customerName: inquiry.customerName,
          customerEmail: inquiry.customerEmail,
          customerPhone: inquiry.customerPhone,
          customerAddress: inquiry.customerAddress,
          title: buildQuoteTitle(inquiry.summary),
        })
        setLinkedInquiryId(inquiry.id)
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error.message || 'Failed to load the inquiry.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadInquiry()

    return () => {
      isCancelled = true
    }
  }, [inquiryId])

  const handleSubmit = async (payload) => {
    const workOrder = await createAdminWorkOrder(payload)
    router.replace(`/admin/work-orders/${workOrder.id}`)
  }

  let form = (
      <WorkOrderForm
        initialValues={initialValues}
        shopInquiryId={linkedInquiryId}
        onSubmit={handleSubmit}
      />
  )

  if (inquiryId && isLoading) {
    form = <CircularProgress size={28} />
  }

  return (
    <AdminShell title="New work order" backHref="/admin/work-orders" backLabel="Work orders">
      <Stack spacing={2}>
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {notice ? <Alert severity="info">{notice}</Alert> : null}
        {existingWorkOrderId ? (
          <Button
            component={Link}
            href={`/admin/work-orders/${existingWorkOrderId}`}
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          >
            Open work order
          </Button>
        ) : null}
        {form}
      </Stack>
    </AdminShell>
  )
}
