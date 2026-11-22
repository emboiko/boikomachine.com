import { NextResponse } from 'next/server'
import { ensureAdmin, serviceErrorResponse } from '@/lib/api/adminGate'
import { getShopInquiry } from '@/lib/services/shopInquiryService'

export const GET = async (request, { params }) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const { id } = await params
    const inquiry = await getShopInquiry(id)
    return NextResponse.json({ inquiry })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to load the inquiry.')
  }
}
