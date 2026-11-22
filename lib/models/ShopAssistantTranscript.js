import mongoose from 'mongoose'

const TranscriptAttachmentSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storageKey: { type: String, required: true },
    blobUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

const TranscriptMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

const ShopAssistantTranscriptSchema = new mongoose.Schema(
  {
    audience: { type: String, enum: ['public', 'admin'], required: true },
    sessionId: { type: String, required: true },
    inquiryId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ipHash: { type: String, default: '' },
    messages: { type: [TranscriptMessageSchema], default: [] },
    attachments: { type: [TranscriptAttachmentSchema], default: [] },
  },
  { timestamps: true },
)

ShopAssistantTranscriptSchema.index({ audience: 1, sessionId: 1 }, { unique: true })
ShopAssistantTranscriptSchema.index({ audience: 1, ipHash: 1 })

const existingTranscript = mongoose.models.ShopAssistantTranscript
const cachedTranscriptAttachments = Boolean(existingTranscript?.schema?.path('attachments'))

if (existingTranscript && !cachedTranscriptAttachments) {
  delete mongoose.models.ShopAssistantTranscript
}

export const ShopAssistantTranscript =
  mongoose.models.ShopAssistantTranscript ||
  mongoose.model('ShopAssistantTranscript', ShopAssistantTranscriptSchema)
