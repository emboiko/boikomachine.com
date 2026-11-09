import { NextResponse } from 'next/server'
import { ensureAdmin, serviceErrorResponse } from '@/lib/api/adminGate'
import { createWorkOrder, listWorkOrders } from '@/lib/services/workOrderService'
import { workOrderWriteSchema } from '@/lib/validation/workOrder'

export const GET = async (request) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const workOrders = await listWorkOrders()

    return NextResponse.json({ workOrders })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to load work orders.')
  }
}

export const POST = async (request) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const body = await request.json()
    const parsed = workOrderWriteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid work order.', errors: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const workOrder = await createWorkOrder(parsed.data)

    return NextResponse.json({ workOrder }, { status: 201 })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to create work order.')
  }
}
