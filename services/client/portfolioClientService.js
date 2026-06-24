import { parseJsonResponse } from '@/services/client/parseJsonResponse';

export const fetchPortfolioItems = async () => {
  const response = await fetch('/api/portfolio', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const data = await parseJsonResponse(response);
  return data.items;
};
