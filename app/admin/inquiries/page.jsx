import { AdminInquiriesPage } from '@/components/admin/AdminInquiriesPage'

export const metadata = {
  title: 'Inquiries',
  robots: {
    index: false,
    follow: false,
  },
}

export default function InquiriesPage() {
  return <AdminInquiriesPage />
}
