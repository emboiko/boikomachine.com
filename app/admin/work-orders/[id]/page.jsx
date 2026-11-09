import { AdminWorkOrderEditPage } from '@/components/admin/AdminWorkOrderEditPage'

export const metadata = {
  title: 'Work order',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function EditWorkOrderPage({ params }) {
  const { id } = await params

  return <AdminWorkOrderEditPage workOrderId={id} />
}
