import { PORTFOLIO_CATEGORIES } from '@/lib/constants';

export const getPortfolioCategoryLabel = (categorySlug) => {
  const category = PORTFOLIO_CATEGORIES.find((entry) => entry.slug === categorySlug);

  if (!category) {
    return categorySlug;
  }

  return category.label;
};
