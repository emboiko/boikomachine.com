import mongoose from 'mongoose';

const AnalyticsEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['page_view', 'cta_click', 'form_submit', 'portfolio_view'],
    },
    path: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    sessionId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AnalyticsEventSchema.index({ createdAt: -1 });

export const AnalyticsEvent =
  mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
