import { BUSINESS } from '@/lib/constants'

const buildApiCatalog = () => {
  const siteUrl = BUSINESS.siteUrl
  const openApiUrl = `${siteUrl}/openapi.json`
  const serviceDocUrl = `${siteUrl}/auth.md`
  const statusUrl = `${siteUrl}/api/health`

  const describePublicApi = (path) => {
    return {
      anchor: `${siteUrl}${path}`,
      'service-desc': [
        {
          href: openApiUrl,
          type: 'application/json',
          title: 'OpenAPI description of public HTTP APIs',
        },
      ],
      'service-doc': [
        {
          href: serviceDocUrl,
          type: 'text/markdown',
          title: 'Agent authentication and access notes',
        },
        {
          href: `${siteUrl}/`,
          type: 'text/html',
          title: BUSINESS.name,
        },
      ],
      status: [
        {
          href: statusUrl,
          type: 'application/json',
          title: 'Service health',
        },
      ],
    }
  }

  return {
    linkset: [
      {
        anchor: `${siteUrl}/.well-known/api-catalog`,
        item: [
          { href: `${siteUrl}/api/health`, title: 'Health check' },
          { href: `${siteUrl}/api/portfolio/categories`, title: 'Portfolio categories' },
          { href: `${siteUrl}/api/portfolio`, title: 'Portfolio items by category' },
          { href: `${siteUrl}/api/portfolio/{slug}`, title: 'Portfolio item by slug' },
          { href: `${siteUrl}/api/contact`, title: 'Human contact form submission' },
          { href: `${siteUrl}/api/contact/agent`, title: 'Agent contact submission' },
        ],
        'service-desc': [
          {
            href: openApiUrl,
            type: 'application/json',
            title: 'OpenAPI description of public HTTP APIs',
          },
        ],
        'service-doc': [
          {
            href: serviceDocUrl,
            type: 'text/markdown',
            title: 'Agent authentication and access notes',
          },
        ],
        status: [
          {
            href: statusUrl,
            type: 'application/json',
            title: 'Service health',
          },
        ],
      },
      describePublicApi('/api/health'),
      describePublicApi('/api/portfolio/categories'),
      describePublicApi('/api/portfolio'),
      describePublicApi('/api/contact'),
      describePublicApi('/api/contact/agent'),
    ],
  }
}

const catalogLinkHeader =
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"'

export const GET = async () => {
  return new Response(JSON.stringify(buildApiCatalog(), null, 2), {
    headers: {
      'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      Link: catalogLinkHeader,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export const HEAD = async () => {
  return new Response(null, {
    headers: {
      'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      Link: catalogLinkHeader,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
