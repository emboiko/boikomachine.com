'use client'

import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { ResizableCopilotPanel } from '@/components/admin/ResizableCopilotPanel'
import { ShopAssistantChat } from '@/components/shopAssistant/ShopAssistantChat'
import {
  addAdminInquiryNote,
  fetchAdminInquiry,
  updateAdminInquiryStatus,
} from '@/services/client/adminInquiryClientService'
import {
  SHOP_INQUIRY_ASSESSMENT_LABELS,
  SHOP_INQUIRY_STATUS_LABELS,
} from '@/lib/shopAssistant/statuses'

const STATUS_ACTIONS = [
  { status: 'needs_info', label: 'Needs info' },
  { status: 'accepted', label: 'Accept' },
  { status: 'declined', label: 'Decline' },
]

export const AdminInquiryDetailPage = ({ inquiryId }) => {
  const [inquiry, setInquiry] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [noteDraft, setNoteDraft] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [pendingStatus, setPendingStatus] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineDraft, setDeclineDraft] = useState('')

  useEffect(() => {
    let isCancelled = false

    const loadInquiry = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const nextInquiry = await fetchAdminInquiry(inquiryId)

        if (!isCancelled) {
          setInquiry(nextInquiry)
        }
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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setErrorMessage('')

    try {
      const nextInquiry = await fetchAdminInquiry(inquiryId)
      setInquiry(nextInquiry)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to reload the inquiry.')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleStatus = async (status) => {
    setPendingStatus(status)
    setErrorMessage('')

    try {
      const result = await updateAdminInquiryStatus(inquiryId, status)
      setInquiry(result.inquiry)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update the inquiry.')
    } finally {
      setPendingStatus('')
    }
  }

  const handleOpenDecline = () => {
    setDeclineDraft('')
    setDeclineOpen(true)
  }

  const handleCloseDecline = () => {
    if (pendingStatus === 'declined') {
      return
    }

    setDeclineOpen(false)
  }

  const handleConfirmDecline = async () => {
    setPendingStatus('declined')
    setErrorMessage('')

    try {
      const result = await updateAdminInquiryStatus(inquiryId, 'declined', declineDraft)
      setInquiry(result.inquiry)
      setDeclineOpen(false)
      setDeclineDraft('')

      if (!result.emailSent) {
        let warning = 'The inquiry was declined, but the email was not sent.'

        if (result.emailReason) {
          warning = `${warning} ${result.emailReason}`
        }

        setErrorMessage(warning)
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to decline the inquiry.')
    } finally {
      setPendingStatus('')
    }
  }

  const handleAddNote = async (event) => {
    event.preventDefault()
    const text = noteDraft.trim()

    if (!text) {
      return
    }

    setIsSavingNote(true)
    setErrorMessage('')

    try {
      const nextInquiry = await addAdminInquiryNote(inquiryId, text, 'owner')
      setInquiry(nextInquiry)
      setNoteDraft('')
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save the note.')
    } finally {
      setIsSavingNote(false)
    }
  }

  let body = <CircularProgress size={28} />

  if (!isLoading && inquiry) {
    const assessment = inquiry.assistantAssessment
    let assessmentBlock = (
      <Typography variant="body2" color="text.secondary">
        No feasibility recommendation yet.
      </Typography>
    )

    if (assessment) {
      assessmentBlock = (
        <Stack spacing={1}>
          <Typography variant="body1">
            {SHOP_INQUIRY_ASSESSMENT_LABELS[assessment.recommendation] || assessment.recommendation}
          </Typography>
          {assessment.reasons.map((reason, index) => {
            return (
              <Typography key={`${index}-${reason}`} variant="body2">
                {reason}
              </Typography>
            )
          })}
          {assessment.missingInformation.map((item, index) => {
            return (
              <Typography key={`${index}-${item}`} variant="body2" color="text.secondary">
                Still needed: {item}
              </Typography>
            )
          })}
        </Stack>
      )
    }

    let reloadLabel = 'Reload'

    if (isRefreshing) {
      reloadLabel = 'Reloading…'
    }

    let quoteAction = null

    if (inquiry.workOrderId) {
      quoteAction = (
        <Button
          component={Link}
          href={`/admin/work-orders/${inquiry.workOrderId}`}
          variant="contained"
        >
          Open work order
        </Button>
      )
    } else if (inquiry.status === 'accepted') {
      quoteAction = (
        <Button
          component={Link}
          href={`/admin/work-orders/new?inquiry=${inquiry.id}`}
          variant="contained"
        >
          Write quote
        </Button>
      )
    }

    body = (
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
        <Stack spacing={3} sx={{ flex: 1, minWidth: 0 }}>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {inquiry.referenceCode} ·{' '}
              {SHOP_INQUIRY_STATUS_LABELS[inquiry.status] || inquiry.status}
            </Typography>
            <Typography variant="h3" sx={{ fontSize: '1.25rem' }}>
              {inquiry.customerName}
            </Typography>
            <Typography variant="body2">{inquiry.customerEmail}</Typography>
            {inquiry.customerPhone ? (
              <Typography variant="body2">{inquiry.customerPhone}</Typography>
            ) : null}
            {inquiry.customerAddress ? (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {inquiry.customerAddress}
              </Typography>
            ) : null}
          </Stack>

          {inquiry.attachments && inquiry.attachments.length > 0 ? (
            <Stack spacing={1}>
              <Typography variant="h3" sx={{ fontSize: '1.05rem' }}>
                Files
              </Typography>
              {inquiry.attachments.map((attachment) => {
                const isImage = attachment.mimeType && attachment.mimeType.startsWith('image/')

                return (
                  <Stack key={attachment.storageKey} spacing={0.5}>
                    <Typography
                      component={Link}
                      href={attachment.downloadUrl}
                      variant="body2"
                      target="_blank"
                      sx={{
                        color: 'text.primary',
                        '&:visited': {
                          color: 'text.primary',
                        },
                      }}
                    >
                      {attachment.originalName}
                    </Typography>
                    {isImage ? (
                      <Box
                        component="img"
                        src={attachment.downloadUrl}
                        alt={attachment.originalName}
                        sx={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain' }}
                      />
                    ) : null}
                  </Stack>
                )
              })}
            </Stack>
          ) : null}

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {STATUS_ACTIONS.map((action) => {
              return (
                <Button
                  key={action.status}
                  variant="outlined"
                  disabled={pendingStatus !== '' || inquiry.status === action.status}
                  onClick={() => {
                    if (action.status === 'declined') {
                      handleOpenDecline()
                      return
                    }

                    handleStatus(action.status)
                  }}
                >
                  {action.label}
                </Button>
              )
            })}
            {quoteAction}
            <Button variant="text" onClick={handleRefresh} disabled={isRefreshing}>
              {reloadLabel}
            </Button>
          </Stack>

          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {inquiry.summary}
          </Typography>

          <Stack spacing={1}>
            <Typography variant="h3" sx={{ fontSize: '1.05rem' }}>
              Feasibility
            </Typography>
            {assessmentBlock}
          </Stack>

          <Stack spacing={1}>
            <Typography variant="h3" sx={{ fontSize: '1.05rem' }}>
              Private notes
            </Typography>
            {inquiry.privateNotes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No private notes yet.
              </Typography>
            ) : (
              inquiry.privateNotes.map((note) => {
                const isOwnerNote = note.author === 'owner'
                let noteSx = { whiteSpace: 'pre-wrap' }

                if (isOwnerNote) {
                  noteSx = {
                    whiteSpace: 'pre-wrap',
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    borderLeft: 3,
                    borderColor: 'primary.main',
                    bgcolor: 'action.selected',
                  }
                }

                return (
                  <Box key={note.id} sx={noteSx}>
                    {isOwnerNote ? (
                      <Typography variant="caption" color="primary" display="block">
                        Your note
                      </Typography>
                    ) : null}
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {note.text}
                    </Typography>
                  </Box>
                )
              })
            )}
            <Stack
              component="form"
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              onSubmit={handleAddNote}
            >
              <TextField
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                label="Add a private note"
                size="small"
                fullWidth
              />
              <Button
                type="submit"
                variant="outlined"
                disabled={isSavingNote || noteDraft.trim().length === 0}
              >
                Save note
              </Button>
            </Stack>
          </Stack>
        </Stack>

        <ResizableCopilotPanel defaultWidth={380} defaultHeight={640}>
          <ShopAssistantChat
            endpoint="/api/admin/shop-assistant/chat"
            historyUrl={`/api/admin/shop-assistant/chat?inquiryId=${encodeURIComponent(inquiry.id)}`}
            chatId={`admin-inquiry-${inquiry.id}`}
            inquiryId={inquiry.id}
            title="Shop copilot"
            emptyMessage="Ask whether this job fits the shop. Recommendations stay on this inquiry until you accept or decline it."
          />
        </ResizableCopilotPanel>
      </Stack>
    )
  }

  let declineButtonLabel = 'Decline and send'

  if (pendingStatus === 'declined') {
    declineButtonLabel = 'Sending…'
  }

  return (
    <AdminShell title="Inquiry" backHref="/admin/inquiries" backLabel="Inquiries" maxWidth="lg">
      <Stack spacing={2}>
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {body}
      </Stack>
      <Dialog open={declineOpen} onClose={handleCloseDecline} fullWidth maxWidth="sm">
        <DialogTitle>Decline this inquiry</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Leave this blank to send a short apology. Anything you write or paste here is the
              message the customer receives, with the shop letterhead.
            </Typography>
            <TextField
              value={declineDraft}
              onChange={(event) => setDeclineDraft(event.target.value)}
              label="Message to the customer"
              placeholder="Sorry we aren't able to take this on..."
              multiline
              minRows={6}
              fullWidth
              disabled={pendingStatus === 'declined'}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDecline} disabled={pendingStatus === 'declined'}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDecline}
            disabled={pendingStatus === 'declined'}
          >
            {declineButtonLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminShell>
  )
}
