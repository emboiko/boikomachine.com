import { NextResponse } from 'next/server'
import { ensureAdmin, serviceErrorResponse } from '@/lib/api/adminGate'
import { listShopInquiries } from '@/lib/services/shopInquiryService'

export const GET = async (request) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const inquiries = await listShopInquiries()
    return NextResponse.json({ inquiries })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to load inquiries.')
  }
}
