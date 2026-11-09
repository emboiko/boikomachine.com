import { NextResponse } from 'next/server'
import { ensureAdmin, serviceErrorResponse } from '@/lib/api/adminGate'
import { sendWorkOrder } from '@/lib/services/workOrderService'

export const POST = async (request, { params }) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const { id } = await params
    const result = await sendWorkOrder(id)

    if (!result) {
      return NextResponse.json({ message: 'Work order not found.' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to send the quote.')
  }
}
