import { Suspense } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { PayInvoicePage } from '@/components/pages/PayInvoicePage'

export default async function QuoteRoute({ params }) {
  const { code } = await params

  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      }
    >
      <PayInvoicePage invoiceCode={code} stage="quote" />
    </Suspense>
  )
}
