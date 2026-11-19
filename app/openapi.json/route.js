import { AGENT_CONTACT_LIMITS } from '@/lib/agentContact/policy'
import { BUSINESS } from '@/lib/constants'

const buildOpenApiDocument = () => {
  const siteUrl = BUSINESS.siteUrl

  return {
    openapi: '3.1.0',
    info: {
      title: `${BUSINESS.name} public HTTP API`,
      description:
        'Public, unauthenticated endpoints used by the marketing site. Admin, payment, and quote surfaces are intentionally omitted. Humans use POST /api/contact with a Turnstile token. Agents use POST /api/contact/agent.',
      version: '1.0.0',
    },
    servers: [
      {
        url: siteUrl,
      },
    ],
    paths: {
      '/api/health': {
        get: {
          operationId: 'getHealth',
          summary: 'Service health check',
          responses: {
            200: {
              description: 'Service is healthy',
            },
            503: {
              description: 'Service is unhealthy',
            },
          },
        },
      },
      '/api/portfolio/categories': {
        get: {
          operationId: 'listPortfolioCategories',
          summary: 'List portfolio categories',
          responses: {
            200: {
              description: 'Category summaries',
            },
          },
        },
      },
      '/api/portfolio': {
        get: {
          operationId: 'listPortfolioItems',
          summary: 'List portfolio items for a category',
          parameters: [
            {
              name: 'category',
              in: 'query',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Portfolio category slug',
            },
          ],
          responses: {
            200: {
              description: 'Portfolio items for the category',
            },
            400: {
              description: 'Missing or invalid category',
            },
          },
        },
      },
      '/api/portfolio/{slug}': {
        get: {
          operationId: 'getPortfolioItem',
          summary: 'Get a portfolio item by slug',
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            200: {
              description: 'Portfolio item',
            },
            404: {
              description: 'Item not found',
            },
          },
        },
      },
      '/api/contact': {
        post: {
          operationId: 'submitContactForm',
          summary: 'Submit the public contact form',
          description:
            'Human contact form. Requires multipart form fields and a valid Cloudflare Turnstile token. Agents must use POST /api/contact/agent instead.',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'message', 'turnstileToken'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    message: { type: 'string' },
                    turnstileToken: { type: 'string' },
                    files: {
                      type: 'array',
                      items: {
                        type: 'string',
                        format: 'binary',
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Submission accepted',
            },
            400: {
              description: 'Validation or Turnstile failure',
            },
          },
        },
      },
      '/api/contact/agent': {
        post: {
          operationId: 'submitAgentContact',
          summary: 'Submit an inquiry on behalf of a person',
          description: `JSON inquiry for agents. No Turnstile token, API key, or file uploads. Required fields are name, email, and message. Optional fields are phone and agentName. Rate limits: ${AGENT_CONTACT_LIMITS.ipPerHour} submissions per IP hash per hour, ${AGENT_CONTACT_LIMITS.emailPerDay} per email address per 24 hours, and ${AGENT_CONTACT_LIMITS.sitePerDay} site-wide per 24 hours. Returns 403 with code agent_contact_disabled when the shop turns the route off.`,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'message'],
                  properties: {
                    name: { type: 'string', maxLength: 200 },
                    email: { type: 'string', format: 'email', maxLength: 320 },
                    phone: { type: 'string', maxLength: 50 },
                    message: { type: 'string', maxLength: 5000 },
                    agentName: { type: 'string', maxLength: 120 },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Inquiry accepted',
            },
            400: {
              description: 'Invalid JSON or fields',
            },
            403: {
              description: 'Agent contact is disabled (code: agent_contact_disabled)',
            },
            415: {
              description: 'Content-Type is not application/json',
            },
            429: {
              description: 'Rate limit reached. Honor the Retry-After header.',
            },
          },
        },
      },
    },
  }
}

export const GET = async () => {
  return new Response(JSON.stringify(buildOpenApiDocument(), null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
