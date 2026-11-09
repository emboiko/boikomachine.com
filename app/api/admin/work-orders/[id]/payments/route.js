import { NextResponse } from 'next/server'
import { ensureAdmin, serviceErrorResponse } from '@/lib/api/adminGate'
import { recordManualPayment } from '@/lib/services/workOrderService'
import { manualPaymentSchema } from '@/lib/validation/workOrder'

export const POST = async (request, { params }) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const { id } = await params
    const body = await request.json()
    const parsed = manualPaymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid payment.', errors: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const result = await recordManualPayment(id, parsed.data)

    if (!result) {
      return NextResponse.json({ message: 'Work order not found.' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to record the payment.')
  }
}
