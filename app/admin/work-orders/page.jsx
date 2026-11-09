import { AdminWorkOrdersPage } from '@/components/admin/AdminWorkOrdersPage'

export const metadata = {
  title: 'Work orders',
  robots: {
    index: false,
    follow: false,
  },
}

export default function WorkOrdersPage() {
  return <AdminWorkOrdersPage />
}
