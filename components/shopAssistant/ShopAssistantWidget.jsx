'use client'

import { useEffect, useState } from 'react'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { ShopAssistantChat } from '@/components/shopAssistant/ShopAssistantChat'

const PHONE_MEDIA_QUERY = '(max-width: 599.95px)'
const HEADER_OFFSET = 64

const readKeyboardInset = () => {
  const viewport = window.visualViewport

  if (!viewport) {
    return 0
  }

  const coveredHeight = window.innerHeight - viewport.offsetTop - viewport.height

  if (coveredHeight < 0) {
    return 0
  }

  return coveredHeight
}

export const ShopAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [isPhone, setIsPhone] = useState(false)
  const [keyboardInset, setKeyboardInset] = useState(0)
  const [chatSessionKey, setChatSessionKey] = useState(0)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [newChatOpen, setNewChatOpen] = useState(false)

  const handleOpen = () => {
    setHasOpened(true)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleOpenNewChat = () => {
    setNewChatOpen(true)
  }

  const handleCloseNewChat = () => {
    if (isStartingChat) {
      return
    }

    setNewChatOpen(false)
  }

  const handleConfirmNewChat = async () => {
    setIsStartingChat(true)

    try {
      const response = await fetch('/api/shop-assistant/chat/new', {
        method: 'POST',
        credentials: 'same-origin',
      })

      if (!response.ok) {
        return
      }

      setNewChatOpen(false)
      setChatSessionKey((currentKey) => {
        return currentKey + 1
      })
    } finally {
      setIsStartingChat(false)
    }
  }

  let newChatButtonLabel = 'Start new chat'

  if (isStartingChat) {
    newChatButtonLabel = 'Starting…'
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia(PHONE_MEDIA_QUERY)

    const updatePhone = () => {
      setIsPhone(mediaQuery.matches)
    }

    updatePhone()
    mediaQuery.addEventListener('change', updatePhone)

    return () => {
      mediaQuery.removeEventListener('change', updatePhone)
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !isPhone) {
      setKeyboardInset(0)
      return undefined
    }

    const scrollY = window.scrollY
    const { documentElement, body } = document
    const previousHtmlPosition = documentElement.style.position
    const previousHtmlTop = documentElement.style.top
    const previousHtmlLeft = documentElement.style.left
    const previousHtmlRight = documentElement.style.right
    const previousHtmlWidth = documentElement.style.width
    const previousHtmlHeight = documentElement.style.height
    const previousBodyTop = body.style.top
    const previousBodyPosition = body.style.position
    const previousBodyWidth = body.style.width
    const header = document.querySelector('header')
    const previousHeaderTouchAction = header ? header.style.touchAction : ''

    documentElement.classList.add('shop-chat-scroll-lock')
    documentElement.style.position = 'fixed'
    documentElement.style.top = `-${scrollY}px`
    documentElement.style.left = '0'
    documentElement.style.right = '0'
    documentElement.style.width = '100%'
    documentElement.style.height = '100%'
    body.style.position = 'fixed'
    body.style.top = '0'
    body.style.width = '100%'

    if (header) {
      header.style.touchAction = 'none'
    }

    const isMessageList = (target) => {
      if (!(target instanceof Element)) {
        return false
      }

      return Boolean(target.closest('[data-shop-chat-messages]'))
    }

    const preventBackgroundScroll = (event) => {
      if (isMessageList(event.target)) {
        return
      }

      event.preventDefault()
    }

    const pinScroll = () => {
      if (window.scrollY !== scrollY) {
        window.scrollTo(0, scrollY)
      }
    }

    const updateKeyboardInset = () => {
      setKeyboardInset(readKeyboardInset())
    }

    updateKeyboardInset()
    const viewport = window.visualViewport
    const listenerOptions = { passive: false, capture: true }

    if (viewport) {
      viewport.addEventListener('resize', updateKeyboardInset)
      viewport.addEventListener('scroll', updateKeyboardInset)
    }

    window.addEventListener('resize', updateKeyboardInset)
    window.addEventListener('scroll', pinScroll)
    document.addEventListener('touchmove', preventBackgroundScroll, listenerOptions)
    document.addEventListener('wheel', preventBackgroundScroll, listenerOptions)

    if (header) {
      header.addEventListener('touchmove', preventBackgroundScroll, listenerOptions)
      header.addEventListener('wheel', preventBackgroundScroll, listenerOptions)
    }

    return () => {
      document.removeEventListener('touchmove', preventBackgroundScroll, listenerOptions)
      document.removeEventListener('wheel', preventBackgroundScroll, listenerOptions)
      window.removeEventListener('scroll', pinScroll)
      window.removeEventListener('resize', updateKeyboardInset)

      if (header) {
        header.removeEventListener('touchmove', preventBackgroundScroll, listenerOptions)
        header.removeEventListener('wheel', preventBackgroundScroll, listenerOptions)
        header.style.touchAction = previousHeaderTouchAction
      }

      documentElement.classList.remove('shop-chat-scroll-lock')
      documentElement.style.position = previousHtmlPosition
      documentElement.style.top = previousHtmlTop
      documentElement.style.left = previousHtmlLeft
      documentElement.style.right = previousHtmlRight
      documentElement.style.width = previousHtmlWidth
      documentElement.style.height = previousHtmlHeight
      body.style.position = previousBodyPosition
      body.style.top = previousBodyTop
      body.style.width = previousBodyWidth
      window.scrollTo(0, scrollY)

      if (viewport) {
        viewport.removeEventListener('resize', updateKeyboardInset)
        viewport.removeEventListener('scroll', updateKeyboardInset)
      }
    }
  }, [isOpen, isPhone])

  let panelDisplay = 'none'

  if (isOpen) {
    panelDisplay = 'flex'
  }

  let launcher = null

  if (!isOpen) {
    launcher = (
      <Button variant="contained" size="large" startIcon={<ChatIcon />} onClick={handleOpen}>
        Ask the shop
      </Button>
    )
  }

  const isPhoneSheet = isOpen && isPhone
  let wrapperSx = {
    position: 'fixed',
    right: { xs: 16, sm: 24 },
    bottom: { xs: 16, sm: 24 },
    zIndex: 1200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 1.5,
  }
  let paperWidth = { xs: 'calc(100vw - 32px)', sm: 380 }
  let paperHeight = { xs: 'min(70vh, 560px)', sm: 560 }
  let paperRadius = 1
  let paperPaddingBottom = 2
  let paperElevation = 8
  let paperFlex

  if (isPhoneSheet) {
    wrapperSx = {
      position: 'fixed',
      zIndex: 1200,
      display: 'flex',
      flexDirection: 'column',
      top: HEADER_OFFSET,
      left: 0,
      right: 0,
      bottom: keyboardInset,
      width: '100%',
    }
    paperWidth = '100%'
    paperHeight = '100%'
    paperRadius = 0
    paperPaddingBottom = 'max(16px, env(safe-area-inset-bottom))'
    paperElevation = 0
    paperFlex = 1
  }

  return (
    <Box sx={wrapperSx}>
      {hasOpened ? (
        <Paper
          elevation={paperElevation}
          sx={{
            display: panelDisplay,
            flexDirection: 'column',
            width: paperWidth,
            height: paperHeight,
            flex: paperFlex,
            minHeight: 0,
            borderRadius: paperRadius,
            p: 2,
            pb: paperPaddingBottom,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton aria-label="Close shop assistant" onClick={handleClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ShopAssistantChat
              key={chatSessionKey}
              endpoint="/api/shop-assistant/chat"
              historyUrl="/api/shop-assistant/chat"
              chatId={`public-shop-assistant-${chatSessionKey}`}
              title="Ask the shop"
              allowAttachments
              onNewChat={handleOpenNewChat}
              isStartingNewChat={isStartingChat}
              emptyMessage="Ask about equipment, materials, or a part you need made. Photos and drawings can be attached here and will go with your request."
            />
          </Box>
        </Paper>
      ) : null}
      {launcher}
      <Dialog open={newChatOpen} onClose={handleCloseNewChat} fullWidth maxWidth="xs">
        <DialogTitle>Start a new chat?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This clears the conversation from your browser. You will not be able to recover the
            messages or files attached here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewChat} disabled={isStartingChat}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirmNewChat} disabled={isStartingChat}>
            {newChatButtonLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
