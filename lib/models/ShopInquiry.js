import mongoose from 'mongoose'
import {
  SHOP_INQUIRY_ASSESSMENTS,
  SHOP_INQUIRY_STATUSES,
} from '@/lib/shopAssistant/statuses'

const InquiryAttachmentSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storageKey: { type: String, required: true },
    blobUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
  },
  { _id: false },
)

const PrivateNoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: String, enum: ['owner', 'assistant'] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

const AssessmentSchema = new mongoose.Schema(
  {
    recommendation: { type: String, enum: SHOP_INQUIRY_ASSESSMENTS, required: true },
    reasons: { type: [String], default: [] },
    missingInformation: { type: [String], default: [] },
    recordedAt: { type: Date, required: true },
  },
  { _id: false },
)

const ShopInquirySchema = new mongoose.Schema(
  {
    referenceCode: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    customerAddress: { type: String, default: '' },
    summary: { type: String, required: true },
    attachments: { type: [InquiryAttachmentSchema], default: [] },
    status: { type: String, enum: SHOP_INQUIRY_STATUSES, default: 'new' },
    privateNotes: { type: [PrivateNoteSchema], default: [] },
    assistantAssessment: { type: AssessmentSchema, default: null },
    customerDeclineMessage: { type: String, default: '' },
    workOrderId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true },
)

ShopInquirySchema.index({ createdAt: -1 })
ShopInquirySchema.index({ status: 1, createdAt: -1 })

const existingShopInquiry = mongoose.models.ShopInquiry
const cachedNoteSchema = existingShopInquiry?.schema?.path('privateNotes')?.schema
const cachedNoteHasAuthor = Boolean(cachedNoteSchema?.path('author'))
const cachedDeclineMessage = Boolean(existingShopInquiry?.schema?.path('customerDeclineMessage'))
const cachedInquiryAttachments = Boolean(existingShopInquiry?.schema?.path('attachments'))

if (existingShopInquiry && (!cachedNoteHasAuthor || !cachedDeclineMessage || !cachedInquiryAttachments)) {
  delete mongoose.models.ShopInquiry
}

export const ShopInquiry =
  mongoose.models.ShopInquiry || mongoose.model('ShopInquiry', ShopInquirySchema)
