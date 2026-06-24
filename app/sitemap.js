import { BUSINESS } from '@/lib/constants';

export default function sitemap() {
  return [
    {
      url: BUSINESS.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
