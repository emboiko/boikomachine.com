import { BUSINESS } from '@/lib/constants'

const DISALLOWED_PATHS = ['/admin', '/admin/', '/pay', '/pay/', '/quote', '/quote/']

const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=yes'

const buildRobotsTxt = () => {
  const disallowLines = DISALLOWED_PATHS.map((path) => {
    return `Disallow: ${path}`
  }).join('\n')

  return `# Content Signals: https://contentsignals.org/
# search: building a search index and providing search results
# ai-input: inputting content into AI models (RAG, grounding, generative answers)
# ai-train: training or fine-tuning AI models

User-Agent: *
Content-Signal: ${CONTENT_SIGNAL}
Allow: /
${disallowLines}

Sitemap: ${BUSINESS.siteUrl}/sitemap.xml
`
}

export const GET = async () => {
  return new Response(buildRobotsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
