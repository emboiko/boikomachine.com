import { parseJsonResponse } from '@/services/client/parseJsonResponse';

export const fetchPortfolioCategories = async () => {
  const response = await fetch('/api/portfolio/categories', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const data = await parseJsonResponse(response);
  return data.categories;
};

export const fetchPortfolioItemsByCategory = async (categorySlug) => {
  const response = await fetch(`/api/portfolio?category=${encodeURIComponent(categorySlug)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const data = await parseJsonResponse(response);
  return data.items;
};

export const fetchPortfolioItemBySlug = async (slug) => {
  const response = await fetch(`/api/portfolio/${encodeURIComponent(slug)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const data = await parseJsonResponse(response);
  return data.item;
};
