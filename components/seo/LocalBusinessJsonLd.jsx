import { BUSINESS } from '@/lib/constants';

export const LocalBusinessJsonLd = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS.name,
    url: BUSINESS.siteUrl,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    areaServed: [
      'Southern New Hampshire',
      'Merrimack Valley',
      'Northern Massachusetts',
      'Western Vermont',
      'Southern Maine',
    ],
    description:
      'Custom machining, repair, precision prototypes, and tooling. Small jobs welcome.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
