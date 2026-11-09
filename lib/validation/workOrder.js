import { z } from 'zod'

const lineItemSchema = z.object({
  description: z.string().trim().min(1).max(500),
  amountCents: z.number().int().min(0),
})

export const workOrderWriteSchema = z.object({
  customerName: z.string().trim().min(1).max(200),
  customerEmail: z.string().trim().email().max(200),
  customerPhone: z.string().trim().max(50).optional().default(''),
  customerAddress: z.string().trim().max(1000).optional().default(''),
  title: z.string().trim().min(1).max(200),
  lineItems: z.array(lineItemSchema).min(1).max(50),
  depositCents: z.number().int().min(0),
  contractText: z.string().max(20000).optional().default(''),
})

export const manualPaymentSchema = z.object({
  method: z.enum(['check', 'cash']),
  kind: z.enum(['deposit', 'balance']),
  note: z.string().trim().max(500).optional().default(''),
})

export const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().trim().min(1).max(200),
})
