/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['stripe', 'qrcode', 'openai'],
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? '',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  async headers() {
    const discoveryLinkHeader = [
      '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
      '</openapi.json>; rel="service-desc"; type="application/json"',
      '</auth.md>; rel="service-doc"; type="text/markdown"',
      '</auth.md>; rel="describedby"; type="text/markdown"',
    ].join(', ');

    return [
      {
        source: '/',
        headers: [
          {
            key: 'Link',
            value: discoveryLinkHeader,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
