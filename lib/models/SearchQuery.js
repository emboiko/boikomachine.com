import mongoose from 'mongoose';

const SearchQuerySchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    filters: { type: mongoose.Schema.Types.Mixed },
    resultCount: { type: Number, required: true },
    sessionId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

SearchQuerySchema.index({ query: 1, createdAt: -1 });

export const SearchQuery =
  mongoose.models.SearchQuery || mongoose.model('SearchQuery', SearchQuerySchema);
