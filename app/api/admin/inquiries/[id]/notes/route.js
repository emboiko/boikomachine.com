import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ensureAdmin, serviceErrorResponse } from '@/lib/api/adminGate'
import { addShopInquiryNote } from '@/lib/services/shopInquiryService'

const noteSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  author: z.literal('owner'),
})

export const POST = async (request, { params }) => {
  const admin = await ensureAdmin(request)

  if (admin.response) {
    return admin.response
  }

  try {
    const body = await request.json()
    const parsed = noteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ message: 'Write a note before saving it.' }, { status: 400 })
    }

    const { id } = await params
    const inquiry = await addShopInquiryNote(id, parsed.data.text, parsed.data.author)
    return NextResponse.json({ inquiry })
  } catch (error) {
    return serviceErrorResponse(error, 'Failed to save the note.')
  }
}
