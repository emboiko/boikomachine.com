import { BUSINESS } from '@/lib/constants';

export const getPortfolioMediaUrl = (storageKey, filename) => {
  if (!storageKey) {
    return null;
  }

  const params = new URLSearchParams({ pathname: storageKey });

  if (filename) {
    params.set('filename', filename);
  }

  return `/api/portfolio/media?${params.toString()}`;
};
