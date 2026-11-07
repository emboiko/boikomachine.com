import { BUSINESS } from '@/lib/constants';

export const LocalBusinessJsonLd = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS.name,
    alternateName: ['Boiko Machine', 'Boiko Machine and Tool'],
    url: BUSINESS.siteUrl,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Derry',
      addressRegion: 'NH',
      addressCountry: 'US',
    },
    areaServed: [
      'Southern New Hampshire',
      'Merrimack Valley',
      'Northern Massachusetts',
      'Western Vermont',
      'Southern Maine',
    ],
    description:
      'New Hampshire machine shop offering custom machining, repair, precision prototypes, and tooling. Small jobs welcome.',
    knowsAbout: [
      'Custom machining',
      'Machine shop services',
      'Precision prototypes',
      'Tools, jigs, and fixtures',
      '3D printing',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
