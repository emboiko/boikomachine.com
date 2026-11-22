'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

const readMessageText = (message) => {
  if (!Array.isArray(message.parts)) {
    return ''
  }

  return message.parts
    .filter((part) => {
      return part && part.type === 'text' && typeof part.text === 'string'
    })
    .map((part) => {
      return part.text
    })
    .join('')
}

const toUiMessage = (message) => {
  return {
    id: message.id,
    role: message.role,
    parts: [{ type: 'text', text: message.text }],
  }
}

export const ShopAssistantChat = ({
  endpoint,
  historyUrl,
  chatId,
  inquiryId = '',
  title,
  emptyMessage,
  onNewChat,
  isStartingNewChat = false,
  allowAttachments = false,
}) => {
  const [draft, setDraft] = useState('')
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [maxMessageCharacters, setMaxMessageCharacters] = useState(0)
  const [messageLimit, setMessageLimit] = useState(0)
  const [attachments, setAttachments] = useState([])
  const [attachmentError, setAttachmentError] = useState('')
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false)
  const messageListRef = useRef(null)
  const fileInputRef = useRef(null)
  const shouldFollowLatestRef = useRef(true)

  const transport = useMemo(() => {
    const body = {}

    if (inquiryId) {
      body.inquiryId = inquiryId
    }

    return new DefaultChatTransport({
      api: endpoint,
      credentials: 'same-origin',
      body,
    })
  }, [endpoint, inquiryId])

  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: chatId,
    transport,
  })

  useEffect(() => {
    let isCancelled = false

    const loadHistory = async () => {
      setIsHistoryLoaded(false)
      setHistoryError('')

      try {
        const response = await fetch(historyUrl, {
          credentials: 'same-origin',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load the conversation.')
        }

        if (isCancelled) {
          return
        }

        const history = Array.isArray(data.messages) ? data.messages : []

        if (typeof data.maxMessageCharacters === 'number') {
          setMaxMessageCharacters(data.maxMessageCharacters)
        }

        if (typeof data.messageLimit === 'number') {
          setMessageLimit(data.messageLimit)
        }

        if (Array.isArray(data.attachments)) {
          setAttachments(data.attachments)
        }

        setMessages(history.map(toUiMessage))
      } catch (loadError) {
        if (!isCancelled) {
          setHistoryError(loadError.message || 'Failed to load the conversation.')
        }
      } finally {
        if (!isCancelled) {
          setIsHistoryLoaded(true)
        }
      }
    }

    shouldFollowLatestRef.current = true
    loadHistory()

    return () => {
      isCancelled = true
    }
  }, [historyUrl, chatId, setMessages])

  useEffect(() => {
    if (!isHistoryLoaded || !shouldFollowLatestRef.current) {
      return undefined
    }

    const frame = requestAnimationFrame(() => {
      const messageList = messageListRef.current

      if (!messageList) {
        return
      }

      messageList.scrollTop = messageList.scrollHeight
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [isHistoryLoaded, messages])

  const handleMessageListScroll = () => {
    const messageList = messageListRef.current

    if (!messageList) {
      return
    }

    const distanceFromBottom =
      messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight
    shouldFollowLatestRef.current = distanceFromBottom < 48
  }

  const isBusy = status === 'submitted' || status === 'streaming'
  const canSend = isHistoryLoaded && !isBusy && draft.trim().length > 0

  const handleChooseFile = () => {
    if (!fileInputRef.current) {
      return
    }

    fileInputRef.current.click()
  }

  const handleAttachFile = async (event) => {
    const file = event.target.files && event.target.files[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setIsUploadingAttachment(true)
    setAttachmentError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/shop-assistant/files', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to attach the file.')
      }

      setAttachments(data.attachments || [])
    } catch (attachError) {
      setAttachmentError(attachError.message || 'Failed to attach the file.')
    } finally {
      setIsUploadingAttachment(false)
    }
  }

  const handleRemoveAttachment = async (attachmentId) => {
    setAttachmentError('')

    try {
      const response = await fetch('/api/shop-assistant/files', {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentId }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove the file.')
      }

      setAttachments(data.attachments || [])
    } catch (removeError) {
      setAttachmentError(removeError.message || 'Failed to remove the file.')
    }
  }

  const handleDraftChange = (event) => {
    let nextDraft = event.target.value

    if (maxMessageCharacters > 0 && nextDraft.length > maxMessageCharacters) {
      nextDraft = nextDraft.slice(0, maxMessageCharacters)
    }

    setDraft(nextDraft)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const text = draft.trim()

    if (!text || !canSend) {
      return
    }

    setDraft('')
    await sendMessage({ text })
  }

  let statusMessage = ''

  if (!isHistoryLoaded) {
    statusMessage = 'Loading conversation…'
  } else if (isBusy) {
    statusMessage = 'Thinking…'
  }

  const visibleError = historyError || error?.message || ''
  const draftInputProps = {}

  if (maxMessageCharacters > 0) {
    draftInputProps.maxLength = maxMessageCharacters
  }

  let newChatLabel = 'New chat'
  let attachLabel = 'Attach a photo or drawing'
  let attachIcon = <AttachFileIcon fontSize="small" />

  if (isStartingNewChat) {
    newChatLabel = 'Starting…'
  }

  if (isUploadingAttachment) {
    attachLabel = 'Attaching file'
    attachIcon = <CircularProgress size={18} />
  }

  return (
    <Stack spacing={1.5} sx={{ height: '100%', minHeight: 0 }}>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="h3" sx={{ fontSize: '1.05rem' }}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {messageLimit > 0 ? (
            <Typography variant="caption" color="text.secondary">
              {messages.length}/{messageLimit} messages
            </Typography>
          ) : null}
          {onNewChat ? (
            <Button size="small" variant="text" onClick={onNewChat} disabled={isStartingNewChat}>
              {newChatLabel}
            </Button>
          ) : null}
        </Stack>
      </Stack>
      <Box
        ref={messageListRef}
        data-shop-chat-messages=""
        onScroll={handleMessageListScroll}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pr: 0.5,
        }}
      >
        {messages.length === 0 && isHistoryLoaded ? (
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        ) : null}
        {messages.map((message) => {
          const text = readMessageText(message)

          if (!text) {
            return null
          }

          const isUser = message.role === 'user'
          let alignSelf = 'flex-start'
          let messageBackground = 'action.hover'
          let messageColor = 'text.primary'

          if (isUser) {
            alignSelf = 'flex-end'
            messageBackground = 'primary.main'
            messageColor = 'primary.contrastText'
          }

          return (
            <Box
              key={message.id}
              sx={{
                alignSelf,
                maxWidth: '90%',
                px: 1.5,
                py: 1,
                borderRadius: 1,
                bgcolor: messageBackground,
                color: messageColor,
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {text}
              </Typography>
            </Box>
          )
        })}
      </Box>
      {statusMessage ? (
        <Typography variant="caption" color="text.secondary">
          {statusMessage}
        </Typography>
      ) : null}
      {visibleError ? <Alert severity="error">{visibleError}</Alert> : null}
      {attachmentError ? <Alert severity="error">{attachmentError}</Alert> : null}
      {allowAttachments && attachments.length > 0 ? (
        <Stack spacing={0.5}>
          {attachments.map((attachment) => {
            return (
              <Stack key={attachment.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="caption" sx={{ flex: 1, minWidth: 0 }}>
                  {attachment.originalName}
                </Typography>
                <Button size="small" onClick={() => handleRemoveAttachment(attachment.id)}>
                  Remove
                </Button>
              </Stack>
            )
          })}
        </Stack>
      ) : null}
      <Stack component="form" direction="row" spacing={1} onSubmit={handleSubmit}>
        {allowAttachments ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,.stp,.step,.dxf,.sla"
              onChange={handleAttachFile}
            />
            <IconButton
              type="button"
              size="small"
              aria-label={attachLabel}
              onClick={handleChooseFile}
              disabled={!isHistoryLoaded || isBusy || isUploadingAttachment}
            >
              {attachIcon}
            </IconButton>
          </>
        ) : null}
        <TextField
          value={draft}
          onChange={handleDraftChange}
          placeholder="Describe the part or problem"
          size="small"
          fullWidth
          disabled={!isHistoryLoaded || isBusy}
          inputProps={draftInputProps}
          sx={{
            '& .MuiInputBase-input': {
              fontSize: { xs: '1rem', sm: 'inherit' },
            },
          }}
        />
        <Button type="submit" variant="contained" disabled={!canSend}>
          Send
        </Button>
      </Stack>
    </Stack>
  )
}
