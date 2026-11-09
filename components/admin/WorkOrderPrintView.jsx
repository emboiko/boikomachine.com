import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PrintToolbar } from '@/components/admin/PrintToolbar'
import { BUSINESS } from '@/lib/constants'
import { formatShopMailingAddress } from '@/lib/billing/shopAddress'
import { documentLabelForWorkStatus, PAYMENT_STATUS_LABELS } from '@/lib/billing/statuses'
import { formatCents } from '@/lib/money'

export const WorkOrderPrintView = ({ workOrder, payUrl, qrDataUrl }) => {
  const shopAddress = formatShopMailingAddress()
  const documentLabel = documentLabelForWorkStatus(workOrder.workStatus)
  let linkLabel = 'View this quote'
  let qrAlt = 'QR code to view this quote'

  if (workOrder.workStatus === 'completed') {
    linkLabel = 'Pay online'
    qrAlt = 'QR code to pay this invoice online'
  }

  return (
    <Box sx={{ bgcolor: '#ffffff', color: '#1a1a1a', minHeight: '100vh' }}>
      <style>{'@page { size: letter; margin: 0.6in; }'}</style>
      <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, sm: 4 }, py: 4, '@media print': { px: 0, py: 0 } }}>
        <PrintToolbar workOrderId={workOrder.id} />
        <Stack spacing={2}>
          <Box>
            <Typography variant="h1" sx={{ fontSize: '1.75rem', color: 'inherit' }}>
              {BUSINESS.name}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'inherit' }}>
              {shopAddress || BUSINESS.location}
            </Typography>
            <Typography variant="body2" sx={{ color: 'inherit' }}>
              {BUSINESS.phone} · {BUSINESS.email}
            </Typography>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: 'inherit' }}>
              {documentLabel} {workOrder.invoiceCode}
            </Typography>
            <Typography variant="h2" sx={{ fontSize: '1.35rem', color: 'inherit' }}>
              {workOrder.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'inherit' }}>
              {PAYMENT_STATUS_LABELS[workOrder.paymentStatus]}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'inherit' }}>
              {workOrder.customerName}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'inherit' }}>
              {workOrder.customerAddress || 'Address not provided'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'inherit' }}>
              {workOrder.customerEmail}
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={1}>
            {workOrder.lineItems.map((lineItem, index) => (
              <Box
                key={`${index}-${lineItem.description}`}
                sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
              >
                <Typography variant="body2" sx={{ color: 'inherit' }}>
                  {lineItem.description}
                </Typography>
                <Typography variant="body2" sx={{ color: 'inherit', whiteSpace: 'nowrap' }}>
                  {formatCents(lineItem.amountCents)}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Box>
            <Typography variant="body2" sx={{ color: 'inherit' }}>
              Total: {formatCents(workOrder.totalCents)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'inherit' }}>
              Deposit due before work starts: {formatCents(workOrder.depositCents)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'inherit' }}>
              Balance due: {formatCents(workOrder.balanceOutstandingCents)}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'inherit' }}>
            {workOrder.contractText}
          </Typography>

          <Divider />

          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              component="img"
              src={qrDataUrl}
              alt={qrAlt}
              sx={{ width: 148, height: 148 }}
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>
                {linkLabel}
              </Typography>
              <Typography variant="body2" sx={{ color: 'inherit', wordBreak: 'break-all' }}>
                {payUrl}
              </Typography>
              <Typography variant="body2" sx={{ color: 'inherit', mt: 1 }}>
                Make checks payable to {BUSINESS.name} and mail them to the address above.
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
