'use client'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Link from 'next/link'

export const PrintToolbar = ({ workOrderId }) => {
  return (
    <Stack direction="row" spacing={1} sx={{ mb: 3, '@media print': { display: 'none' } }}>
      <Button variant="contained" onClick={() => window.print()}>
        Print
      </Button>
      <Button component={Link} href={`/admin/work-orders/${workOrderId}`} variant="text">
        Back to work order
      </Button>
    </Stack>
  )
}
