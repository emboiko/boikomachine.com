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
import { ResizableCopilotPanel } from '@/components/admin/ResizableCopilotPanel'
import { ShopAssistantChat } from '@/components/shopAssistant/ShopAssistantChat'
import { fetchAdminInquiries } from '@/services/client/adminInquiryClientService'
import { SHOP_INQUIRY_STATUS_LABELS } from '@/lib/shopAssistant/statuses'

export const AdminInquiriesPage = () => {
  const [inquiries, setInquiries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [copilotSessionKey, setCopilotSessionKey] = useState(0)
  const [isStartingChat, setIsStartingChat] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const loadInquiries = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const nextInquiries = await fetchAdminInquiries()

        if (!isCancelled) {
          setInquiries(nextInquiries)
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error.message || 'Failed to load inquiries.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadInquiries()

    return () => {
      isCancelled = true
    }
  }, [])

  const handleNewChat = async () => {
    setIsStartingChat(true)

    try {
      const response = await fetch('/api/admin/shop-assistant/chat/new', {
        method: 'POST',
        credentials: 'same-origin',
      })

      if (!response.ok) {
        return
      }

      setCopilotSessionKey((currentKey) => {
        return currentKey + 1
      })
    } finally {
      setIsStartingChat(false)
    }
  }

  let inquiryList = null

  if (isLoading) {
    inquiryList = <CircularProgress size={28} />
  } else if (inquiries.length === 0) {
    inquiryList = (
      <Typography variant="body2" color="text.secondary">
        No shop inquiries yet. They show up here after a visitor agrees to send a request in the
        public chat.
      </Typography>
    )
  } else {
    inquiryList = (
      <Stack spacing={1.5}>
        {inquiries.map((inquiry) => {
          return (
            <Box
              key={inquiry.id}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body1">{inquiry.referenceCode}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {SHOP_INQUIRY_STATUS_LABELS[inquiry.status] || inquiry.status}
                  </Typography>
                </Stack>
                <Typography variant="body2">{inquiry.customerName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {inquiry.summary}
                </Typography>
                <Button
                  component={Link}
                  href={`/admin/inquiries/${inquiry.id}`}
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Open inquiry
                </Button>
              </Stack>
            </Box>
          )
        })}
      </Stack>
    )
  }

  return (
    <AdminShell title="Inquiries" maxWidth="lg">
      <Stack spacing={3}>
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>{inquiryList}</Box>
          <ResizableCopilotPanel defaultWidth={380} defaultHeight={560}>
            <ShopAssistantChat
              key={copilotSessionKey}
              endpoint="/api/admin/shop-assistant/chat"
              historyUrl="/api/admin/shop-assistant/chat"
              chatId={`admin-shop-copilot-${copilotSessionKey}`}
              title="Shop copilot"
              emptyMessage="Ask whether a kind of job fits the shop, or ask which inquiries are waiting."
              onNewChat={handleNewChat}
              isStartingNewChat={isStartingChat}
            />
          </ResizableCopilotPanel>
        </Stack>
      </Stack>
    </AdminShell>
  )
}
