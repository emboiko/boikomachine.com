'use client'

import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { WorkOrderForm } from '@/components/admin/WorkOrderForm'
import { createAdminWorkOrder } from '@/services/client/adminWorkOrderClientService'

export const AdminWorkOrderCreatePage = () => {
  const router = useRouter()

  const handleSubmit = async (payload) => {
    const workOrder = await createAdminWorkOrder(payload)
    router.replace(`/admin/work-orders/${workOrder.id}`)
  }

  return (
    <AdminShell title="New work order" backHref="/admin/work-orders" backLabel="Work orders">
      <WorkOrderForm onSubmit={handleSubmit} />
    </AdminShell>
  )
}
