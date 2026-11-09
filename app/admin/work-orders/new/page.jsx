import { AdminWorkOrderCreatePage } from '@/components/admin/AdminWorkOrderCreatePage'

export const metadata = {
  title: 'New work order',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NewWorkOrderPage() {
  return <AdminWorkOrderCreatePage />
}
