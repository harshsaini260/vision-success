import { llmsFullTxt } from '@/lib/facts'

/* /llms-full.txt — every course, fee, FAQ and roadmap leg in one file, for
   assistants that want the whole picture without crawling 50 pages. */
export const dynamic = 'force-static'

export function GET() {
  return new Response(llmsFullTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
