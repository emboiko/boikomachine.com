'use client'

import { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'

export const ThemeToggle = () => {
  const { colorScheme, setMode } = useColorScheme()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const isReady = hasMounted && Boolean(colorScheme)
  const isDark = colorScheme === 'dark'
  let label = 'Theme toggle'
  let icon = <DarkModeOutlinedIcon />
  let tabIndex = -1
  let buttonSx = {
    pointerEvents: 'none',
    visibility: 'hidden',
  }

  if (isReady) {
    tabIndex = 0
    buttonSx = undefined

    if (isDark) {
      label = 'Switch to light mode'
      icon = <LightModeOutlinedIcon />
    } else {
      label = 'Switch to dark mode'
    }
  }

  return (
    <Tooltip title={label}>
      <span>
        <IconButton
          aria-label={label}
          aria-hidden={!isReady}
          disabled={!isReady}
          onClick={() => {
            if (isDark) {
              setMode('light')
            } else {
              setMode('dark')
            }
          }}
          color="inherit"
          size="large"
          tabIndex={tabIndex}
          sx={buttonSx}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  )
}
