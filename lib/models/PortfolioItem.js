import mongoose from 'mongoose';

const PortfolioItemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    featured: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

PortfolioItemSchema.index({ featured: 1, sortOrder: 1 });

export const PortfolioItem =
  mongoose.models.PortfolioItem || mongoose.model('PortfolioItem', PortfolioItemSchema);
