import { NextResponse } from 'next/server'
import { ensureAdmin, serviceErrorResponse } from '@/lib/api/adminGate'
import { completeWorkOrder } from '@/lib/services/workOrderService'

export const POST = async (request, { params }) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const { id } = await params
    const workOrder = await completeWorkOrder(id)

    if (!workOrder) {
      return NextResponse.json({ message: 'Work order not found.' }, { status: 404 })
    }

    return NextResponse.json({ workOrder })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to complete the work order.')
  }
}
