import QRCode from 'qrcode'
import { notFound } from 'next/navigation'
import { WorkOrderPrintView } from '@/components/admin/WorkOrderPrintView'
import { buildPayUrl, buildQuoteUrl } from '@/lib/billing/payUrl'
import { getWorkOrder } from '@/lib/services/workOrderService'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Print work order',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function PrintWorkOrderPage({ params }) {
  const { id } = await params
  const workOrder = await getWorkOrder(id)

  if (!workOrder) {
    notFound()
  }

  let documentUrl = buildQuoteUrl(workOrder.invoiceCode)

  if (workOrder.workStatus === 'completed') {
    documentUrl = buildPayUrl(workOrder.invoiceCode)
  }

  const qrDataUrl = await QRCode.toDataURL(documentUrl, { margin: 1, width: 192 })

  return <WorkOrderPrintView workOrder={workOrder} payUrl={documentUrl} qrDataUrl={qrDataUrl} />
}
