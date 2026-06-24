import mongoose from 'mongoose';
import { PORTFOLIO_CATEGORY_SLUGS, PORTFOLIO_WORK_STATUSES } from '@/lib/constants';

const PortfolioImageSchema = new mongoose.Schema(
  {
    storageKey: { type: String, required: true },
    alt: { type: String, default: '' },
    caption: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true },
);

const PortfolioModel3dSchema = new mongoose.Schema(
  {
    storageKey: { type: String, required: true },
    originalName: { type: String, required: true },
  },
  { _id: false },
);

const PortfolioItemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true, enum: PORTFOLIO_CATEGORY_SLUGS },
    description: { type: String, required: true },
    images: { type: [PortfolioImageSchema], default: [] },
    coverStorageKey: { type: String, default: null },
    youtubeUrl: { type: String, default: null },
    model3d: { type: PortfolioModel3dSchema, default: null },
    workStatus: { type: String, enum: PORTFOLIO_WORK_STATUSES, default: undefined },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

PortfolioItemSchema.index({ category: 1, sortOrder: 1 });

export const PortfolioItem =
  mongoose.models.PortfolioItem || mongoose.model('PortfolioItem', PortfolioItemSchema);
