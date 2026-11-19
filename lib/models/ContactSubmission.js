import mongoose from 'mongoose'

const AttachmentSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storageKey: { type: String, required: true },
    blobUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
  },
  { _id: false },
)

const ContactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
    attachments: { type: [AttachmentSchema], default: [] },
    source: { type: String, default: 'contact_form' },
    agentName: { type: String },
    userAgent: { type: String },
    ipHash: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

ContactSubmissionSchema.index({ source: 1, ipHash: 1, createdAt: -1 })
ContactSubmissionSchema.index({ source: 1, email: 1, createdAt: -1 })
ContactSubmissionSchema.index({ source: 1, createdAt: -1 })

export const ContactSubmission =
  mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', ContactSubmissionSchema)
