import { z } from 'zod';
import { PORTFOLIO_CATEGORY_SLUGS } from '@/lib/constants';

const portfolioImageSchema = z.object({
  storageKey: z.string().min(1),
  alt: z.string().max(200).optional().or(z.literal('')),
  caption: z.string().max(500).optional().or(z.literal('')),
  sortOrder: z.number().int().min(0).optional(),
});

const portfolioModel3dSchema = z.object({
  storageKey: z.string().min(1),
  originalName: z.string().min(1).max(255),
});

export const portfolioItemCreateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens.'),
  title: z.string().min(1).max(200),
  category: z.enum(PORTFOLIO_CATEGORY_SLUGS),
  description: z.string().min(1).max(10000),
  images: z.array(portfolioImageSchema).optional().default([]),
  coverStorageKey: z.string().min(1).nullable().optional(),
  youtubeUrl: z.string().max(500).nullable().optional(),
  model3d: portfolioModel3dSchema.nullable().optional(),
  material: z.string().max(100).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const portfolioItemUpdateSchema = portfolioItemCreateSchema.partial();

export const portfolioCategoryQuerySchema = z.object({
  category: z.enum(PORTFOLIO_CATEGORY_SLUGS),
});
