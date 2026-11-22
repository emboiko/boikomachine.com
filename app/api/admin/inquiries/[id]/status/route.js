import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ensureAdmin, serviceErrorResponse } from '@/lib/api/adminGate'
import { declineShopInquiry, updateShopInquiryStatus } from '@/lib/services/shopInquiryService'

const statusSchema = z.object({
  status: z.enum(['needs_info', 'accepted', 'declined']),
  message: z.string().max(5000).optional(),
})

export const POST = async (request, { params }) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const body = await request.json()
    const parsed = statusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ message: 'Choose needs info, accept, or decline.' }, { status: 400 })
    }

    const { id } = await params

    if (parsed.data.status === 'declined') {
      const result = await declineShopInquiry(id, parsed.data.message)
      return NextResponse.json(result)
    }

    const inquiry = await updateShopInquiryStatus(id, parsed.data.status)
    return NextResponse.json({ inquiry })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to update the inquiry.')
  }
}
