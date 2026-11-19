import mongoose from 'mongoose'

const AgentContactLimitNoticeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export const AgentContactLimitNotice =
  mongoose.models.AgentContactLimitNotice ||
  mongoose.model('AgentContactLimitNotice', AgentContactLimitNoticeSchema)
