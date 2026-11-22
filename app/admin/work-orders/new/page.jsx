import { AdminWorkOrderCreatePage } from '@/components/admin/AdminWorkOrderCreatePage'

export const metadata = {
  title: 'New work order',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function NewWorkOrderPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  let inquiryId = ''

  if (typeof resolvedSearchParams.inquiry === 'string') {
    inquiryId = resolvedSearchParams.inquiry
  }

  return <AdminWorkOrderCreatePage inquiryId={inquiryId} />
}
