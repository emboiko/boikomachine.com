import { NextResponse } from 'next/server'
import { serviceErrorResponse } from '@/lib/api/adminGate'
import { getPublicInvoice } from '@/lib/services/workOrderService'

export const GET = async (_request, { params }) => {
  try {
    const { code } = await params
    const invoice = await getPublicInvoice(code)

    return NextResponse.json({ invoice })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to load the quote or invoice.')
  }
}
