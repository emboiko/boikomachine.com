export const BUSINESS = {
  name: 'Boiko Machine & Tool',
  phone: '(978) 346-5977',
  phoneHref: 'tel:+19783465977',
  email: 'info@boikomachine.com',
  emailHref: 'mailto:info@boikomachine.com',
  shopEmail: 'shop@boikomachine.com',
  shopEmailHref: 'mailto:shop@boikomachine.com',
  location: 'Derry, NH',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://boikomachine.com',
};

export const SERVICES = [
  'Custom Machining & Repair',
  'Precision Prototypes',
  'Tools, Jigs & Fixtures',
];

export const CAPABILITIES = [
  'Manual milling',
  'Manual turning',
  'Tool grinding',
  'FDM 3D printing for prototypes, fixtures, tooling, and end-use parts',
  'Limited mild-steel welding (non-certified)',
];

export const SERVICE_AREAS = [
  'Southern New Hampshire and the Merrimack Valley',
  'Greater New Hampshire',
  'Northern Massachusetts',
  'Western Vermont and southern Maine (by arrangement)',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_TOTAL_UPLOAD_BYTES = 25 * 1024 * 1024;

export const ALLOWED_FILE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.pdf',
  '.stp',
  '.step',
  '.dxf',
  '.sla',
];

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
  'model/step',
  'application/sla',
  'application/octet-stream',
  'application/dxf',
  'image/vnd.dxf',
  'text/plain',
];

// todo: clean up placeholder images / this code below

export const PORTFOLIO_IMAGE_FALLBACK = '/images/placeholders/portfolio-default.svg';

export const PORTFOLIO_PLACEHOLDER_IMAGES = {
  machining: '/images/placeholders/portfolio-machining.svg',
  fixtures: '/images/placeholders/portfolio-fixture.svg',
  prototypes: '/images/placeholders/portfolio-prototype.svg',
  repair: '/images/placeholders/portfolio-repair.svg',
  tooling: '/images/placeholders/portfolio-tooling.svg',
  default: PORTFOLIO_IMAGE_FALLBACK,
};
