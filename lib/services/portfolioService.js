import { connectToDatabase } from '@/lib/db/mongoose';
import { PortfolioItem } from '@/lib/models/PortfolioItem';

export const getFeaturedPortfolioItems = async () => {
  await connectToDatabase();

  const items = await PortfolioItem.find({ featured: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return items.map((item) => ({
    id: item._id.toString(),
    slug: item.slug,
    title: item.title,
    category: item.category,
    description: item.description,
    imageUrl: item.imageUrl,
    sortOrder: item.sortOrder,
  }));
};
