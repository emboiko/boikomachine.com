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
  'One-off parts and repair work',
  'Prototype and low-volume projects',
  'Fixtures, tooling, and workholding',
  'Plastics, aluminum, steel, brass, and bronze',
  '3D printing for prototypes and functional parts',
];

export const SERVICE_AREAS = [
  'Southern New Hampshire and the Merrimack Valley',
  'Greater New England',
  'Remote consultation and shipped projects',
  'On-site visits when practical',
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

export const PORTFOLIO_CATEGORIES = [
  {
    slug: 'milling',
    label: 'Milling',
    description: 'Manual milling on a Bridgeport mill - fixtures, brackets, and precision parts.',
  },
  {
    slug: 'turning',
    label: 'Turning',
    description: 'Lathe work on a DoAll 13 - bushings, shafts, and turned components.',
  },
  {
    slug: 'grinding',
    label: 'Grinding',
    description: 'Surface grinding on a Harig grinder - flatness, finish, and tight tolerances.',
  },
  {
    slug: '3d-printing',
    label: '3D Printing',
    description: 'FDM printing for prototypes, fixtures, tooling, and end-use parts.',
  },
  {
    slug: 'welding',
    label: 'Welding',
    description: 'Limited mild-steel welding for fixtures and fabrication (non-certified).',
  },
  {
    slug: 'misc',
    label: 'Misc / Other',
    description: 'Repair work, tooling, jigs, and projects that do not fit a single process.',
  },
];

export const PORTFOLIO_CATEGORY_SLUGS = PORTFOLIO_CATEGORIES.map((category) => category.slug);

export const PORTFOLIO_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];
