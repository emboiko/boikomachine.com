import { tool } from '@openai/agents'
import { z } from 'zod'
import { createShopInquiryFromAssistant } from '@/lib/services/shopInquiryService'

const describeSubmitResult = (result) => {
  const referenceCode = result.inquiry.referenceCode

  if (result.alreadySubmitted) {
    return `This conversation already submitted inquiry ${referenceCode}. Do not submit another.`
  }

  if (!result.emailSent) {
    return `Inquiry ${referenceCode} was saved. The shop email could not be sent. Tell the visitor the reference code.`
  }

  return `Inquiry ${referenceCode} was saved and the shop was notified. Tell the visitor the reference code.`
}

const reportToolError = (_runContext, error) => {
  if (error && error.status && error.status < 500 && error.message) {
    return error.message
  }

  return 'The tool could not complete that action.'
}

export const submitShopInquiryTool = tool({
  name: 'submitShopInquiry',
  description:
    'Save one shop inquiry after the visitor explicitly agrees to send their name, email, and request. Include a mailing address only when they gave one. Call this only once per conversation.',
  parameters: z.object({
    customerName: z.string().min(1).max(200),
    customerEmail: z.string().email().max(320),
    customerPhone: z.string().max(50),
    customerAddress: z.string().max(1000),
    summary: z.string().min(1).max(5000),
  }),
  errorFunction: reportToolError,
  execute: async (input, runContext) => {
    const transcriptId = runContext?.context?.transcriptId
    const result = await createShopInquiryFromAssistant({
      transcriptId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress,
      summary: input.summary,
    })

    return describeSubmitResult(result)
  },
})
