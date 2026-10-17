import { SITE } from '@/lib/site'

/* ─── robots.txt ───
   Everyone may read the public site; nobody needs /admin or the API.

   The AI assistants are named one by one on purpose. "User-agent: *"
   already lets them in, but several of them (and the people who audit
   sites for them) look for their own name, and a site that names them is
   one that has decided to be found in AI answers — which is exactly where
   a parent in Una now asks "best NDA coaching near me". Search crawlers
   (Googlebot, Bingbot) are covered by the first rule; ChatGPT's search
   results come from Bing's index, so Bing matters as much as Google here.

   The llms.txt files (app/llms.txt, app/llms-full.txt) are the plain-text
   summary these assistants read first. */

const PRIVATE = ['/admin', '/api/', '/expense-tracker']

const AI_AGENTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',            // OpenAI
  'ClaudeBot', 'Claude-User', 'Claude-SearchBot',       // Anthropic
  'PerplexityBot', 'Perplexity-User',                    // Perplexity
  'Google-Extended', 'GoogleOther',                      // Gemini / Google AI
  'Applebot', 'Applebot-Extended',                       // Apple Intelligence, Siri
  'Bingbot', 'msnbot',                                   // Bing → Copilot and ChatGPT search
  'meta-externalagent', 'Amazonbot', 'DuckAssistBot', 'MistralAI-User', 'YouBot', 'cohere-ai',
]

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVATE })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
