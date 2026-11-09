import mongoose from 'mongoose'
import { PAYMENT_KINDS, PAYMENT_METHODS } from '@/lib/billing/statuses'

const PaymentSchema = new mongoose.Schema(
  {
    workOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkOrder',
      required: true,
      index: true,
    },
    kind: { type: String, enum: PAYMENT_KINDS, required: true },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    amountCents: { type: Number, required: true },
    status: { type: String, enum: ['succeeded'], default: 'succeeded' },
    note: { type: String, default: '' },
    stripePaymentIntentId: { type: String },
    receiptSentAt: { type: Date, default: null },
  },
  { timestamps: true },
)

PaymentSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true })

export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)
