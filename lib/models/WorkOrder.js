import mongoose from 'mongoose'
import { WORK_STATUSES } from '@/lib/billing/statuses'

const WorkOrderLineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amountCents: { type: Number, required: true },
  },
  { _id: false },
)

const WorkOrderSchema = new mongoose.Schema(
  {
    invoiceCode: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    customerAddress: { type: String, default: '' },
    title: { type: String, required: true },
    lineItems: { type: [WorkOrderLineItemSchema], required: true },
    depositCents: { type: Number, required: true },
    contractText: { type: String, default: '' },
    workStatus: { type: String, enum: WORK_STATUSES, default: 'created' },
    sentAt: { type: Date, default: null },
    invoiceSentAt: { type: Date, default: null },
    depositPaidAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    openStripePaymentIntentId: { type: String, default: null },
    openStripePaymentIntentKind: { type: String, default: null },
    openStripePaymentIntentAmountCents: { type: Number, default: null },
  },
  { timestamps: true },
)

WorkOrderSchema.index({ createdAt: -1 })

export const WorkOrder = mongoose.models.WorkOrder || mongoose.model('WorkOrder', WorkOrderSchema)
