import { AdminInquiryDetailPage } from '@/components/admin/AdminInquiryDetailPage'

export const metadata = {
  title: 'Inquiry',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function InquiryDetailPage({ params }) {
  const { id } = await params

  return <AdminInquiryDetailPage inquiryId={id} />
}
