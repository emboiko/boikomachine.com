import { NextResponse } from 'next/server'
import { serviceErrorResponse } from '@/lib/api/adminGate'
import { confirmPublicPayment } from '@/lib/services/workOrderService'
import { confirmPaymentSchema } from '@/lib/validation/workOrder'

export const POST = async (request, { params }) => {
  try {
    const { code } = await params
    const body = await request.json()
    const parsed = confirmPaymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid payment confirmation.' }, { status: 400 })
    }

    const result = await confirmPublicPayment(code, parsed.data.paymentIntentId)

    return NextResponse.json(result)
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to confirm the payment.')
  }
}
