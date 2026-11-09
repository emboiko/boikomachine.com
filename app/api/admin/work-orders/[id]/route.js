import { NextResponse } from 'next/server'
import { ensureAdmin, serviceErrorResponse } from '@/lib/api/adminGate'
import { getWorkOrder, updateWorkOrder } from '@/lib/services/workOrderService'
import { workOrderWriteSchema } from '@/lib/validation/workOrder'

export const GET = async (request, { params }) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const { id } = await params
    const workOrder = await getWorkOrder(id)

    if (!workOrder) {
      return NextResponse.json({ message: 'Work order not found.' }, { status: 404 })
    }

    return NextResponse.json({ workOrder })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to load work order.')
  }
}

export const PATCH = async (request, { params }) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const { id } = await params
    const body = await request.json()
    const parsed = workOrderWriteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid work order.', errors: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const workOrder = await updateWorkOrder(id, parsed.data)

    if (!workOrder) {
      return NextResponse.json({ message: 'Work order not found.' }, { status: 404 })
    }

    return NextResponse.json({ workOrder })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to update work order.')
  }
}
