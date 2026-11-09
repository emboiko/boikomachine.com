import { BUSINESS } from '@/lib/constants';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/pay', '/pay/', '/quote', '/quote/'],
    },
    sitemap: `${BUSINESS.siteUrl}/sitemap.xml`,
  };
}
