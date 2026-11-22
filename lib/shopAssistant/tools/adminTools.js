import { tool } from '@openai/agents'
import { z } from 'zod'
import {
  addShopInquiryNote,
  getShopInquiry,
  listOpenShopInquiries,
  recordShopInquiryAssessment,
} from '@/lib/services/shopInquiryService'

const reportToolError = (_runContext, error) => {
  if (error && error.status && error.status < 500 && error.message) {
    return error.message
  }

  return 'The tool could not complete that action.'
}

const inquiryIdSchema = z.object({
  inquiryId: z.string().min(1).max(40),
})

export const getInquiryTool = tool({
  name: 'getInquiry',
  description:
    'Read one shop inquiry, including private notes and the latest feasibility assessment. This is never shown to customers.',
  parameters: inquiryIdSchema,
  errorFunction: reportToolError,
  execute: async (input) => {
    const inquiry = await getShopInquiry(input.inquiryId)
    return JSON.stringify(inquiry)
  },
})

export const listOpenInquiriesTool = tool({
  name: 'listOpenInquiries',
  description:
    'List recent shop inquiries that are still open, including accepted inquiries that do not have a work order yet.',
  parameters: z.object({
    statusGroup: z.literal('open'),
  }),
  errorFunction: reportToolError,
  execute: async () => {
    const inquiries = await listOpenShopInquiries()
    return JSON.stringify(inquiries)
  },
})

export const addPrivateNoteTool = tool({
  name: 'addPrivateNote',
  description:
    'Append a private note to an inquiry. The note is for the shop only and is not emailed to the customer.',
  parameters: z.object({
    inquiryId: z.string().min(1).max(40),
    note: z.string().min(1).max(2000),
  }),
  errorFunction: reportToolError,
  execute: async (input) => {
    const inquiry = await addShopInquiryNote(input.inquiryId, input.note, 'assistant')
    return `Saved a private note on ${inquiry.referenceCode}.`
  },
})

export const recordAssessmentTool = tool({
  name: 'recordAssessment',
  description:
    'Store a feasibility recommendation on an inquiry. This does not accept, decline, or email the customer.',
  parameters: z.object({
    inquiryId: z.string().min(1).max(40),
    recommendation: z.enum(['feasible', 'not_feasible', 'needs_info']),
    reasons: z.array(z.string().min(1).max(500)).min(1).max(8),
    missingInformation: z.array(z.string().min(1).max(500)).max(8),
  }),
  errorFunction: reportToolError,
  execute: async (input) => {
    const inquiry = await recordShopInquiryAssessment({
      inquiryId: input.inquiryId,
      recommendation: input.recommendation,
      reasons: input.reasons,
      missingInformation: input.missingInformation,
    })

    return `Recorded a ${inquiry.assistantAssessment.recommendation} assessment on ${inquiry.referenceCode}. The inquiry status is still ${inquiry.status}.`
  },
})
