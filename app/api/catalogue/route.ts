import { getCatalogue, CATALOGUE_REVALIDATE } from '@/lib/catalogue'

/**
 * The catalogue, served as JSON and cached at Vercel's edge.
 *
 * - The upstream Google Sheet is read through the Next.js Data Cache (refreshed
 *   every CATALOGUE_REVALIDATE seconds) with an in-memory last-known-good copy,
 *   so the slow Apps Script is hit at most once per window.
 * - The edge CDN keeps the response for CATALOGUE_REVALIDATE seconds and keeps
 *   serving the previous copy for up to a day while it refreshes in the
 *   background, so visitors never wait on Google.
 * - An empty result is NEVER cached (503 + no-store): the client retries and
 *   the next request tries the sheet again. This is what prevents the old
 *   "0 products frozen for everyone" bug.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await getCatalogue()

  if (!items.length) {
    return Response.json(
      { error: 'Catalogue temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '3' } },
    )
  }

  return Response.json(items, {
    headers: {
      'Cache-Control': `public, max-age=60, s-maxage=${CATALOGUE_REVALIDATE}, stale-while-revalidate=86400`,
    },
  })
}
