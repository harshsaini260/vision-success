import { llmsTxt } from '@/lib/facts'

/* /llms.txt — the plain-text map AI assistants read first (llmstxt.org).
   Built from lib/facts.js at build time, so it can never disagree with
   the pages it describes. */
export const dynamic = 'force-static'

export function GET() {
  return new Response(llmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
