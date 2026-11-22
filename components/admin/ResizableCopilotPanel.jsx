'use client'

import { useRef, useState } from 'react'
import Box from '@mui/material/Box'

const MINIMUM_WIDTH = 300
const MINIMUM_HEIGHT = 360
const MAXIMUM_WIDTH = 760

const clampSize = (value, minimum, maximum) => {
  if (value < minimum) {
    return minimum
  }

  if (value > maximum) {
    return maximum
  }

  return value
}

export const ResizableCopilotPanel = ({ defaultWidth, defaultHeight, children }) => {
  const [size, setSize] = useState({
    width: defaultWidth,
    height: defaultHeight,
  })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef(null)

  const endDrag = (event) => {
    const drag = dragRef.current

    if (!drag || event.pointerId !== drag.pointerId) {
      return
    }

    dragRef.current = null
    setIsDragging(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const startDrag = (event, edges) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: size.width,
      startHeight: size.height,
      edges,
    }
    setIsDragging(true)
  }

  const moveDrag = (event) => {
    const drag = dragRef.current

    if (!drag || event.pointerId !== drag.pointerId) {
      return
    }

    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    const maximumHeight = Math.max(MINIMUM_HEIGHT, window.innerHeight - 96)
    let nextWidth = drag.startWidth
    let nextHeight = drag.startHeight

    if (drag.edges.width) {
      nextWidth = clampSize(drag.startWidth - deltaX, MINIMUM_WIDTH, MAXIMUM_WIDTH)
    }

    if (drag.edges.height) {
      nextHeight = clampSize(drag.startHeight + deltaY, MINIMUM_HEIGHT, maximumHeight)
    }

    setSize({
      width: nextWidth,
      height: nextHeight,
    })
  }

  let userSelect = 'auto'

  if (isDragging) {
    userSelect = 'none'
  }

  const handleSx = {
    position: 'absolute',
    touchAction: 'none',
    zIndex: 1,
  }

  return (
    <Box
      sx={{
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        width: { xs: '100%', lg: size.width },
        height: size.height,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        userSelect,
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
      <Box
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize shop copilot width"
        onPointerDown={(event) => startDrag(event, { width: true, height: false })}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        sx={{
          ...handleSx,
          top: 8,
          bottom: 16,
          left: -4,
          width: 8,
          cursor: 'ew-resize',
          display: { xs: 'none', lg: 'block' },
        }}
      />
      <Box
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize shop copilot height"
        onPointerDown={(event) => startDrag(event, { width: false, height: true })}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        sx={{
          ...handleSx,
          left: 16,
          right: 8,
          bottom: -4,
          height: 8,
          cursor: 'ns-resize',
        }}
      />
      <Box
        role="separator"
        aria-label="Resize shop copilot"
        onPointerDown={(event) => startDrag(event, { width: true, height: true })}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        sx={{
          ...handleSx,
          left: 2,
          bottom: 2,
          width: 14,
          height: 14,
          cursor: 'nesw-resize',
          display: { xs: 'none', lg: 'block' },
          borderLeft: 2,
          borderBottom: 2,
          borderColor: 'text.disabled',
        }}
      />
    </Box>
  )
}
