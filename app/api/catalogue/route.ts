import { getCatalogue, CATALOGUE_REVALIDATE } from '@/lib/catalogue'

/**
 * Server-side cached proxy for the catalogue. Used by the client hook to
 * revalidate in the background. Shares the same cached upstream fetch as the
 * server-rendered page, so this is effectively free after warm-up.
 */
export const revalidate = 300

export async function GET() {
  const items = await getCatalogue()
  return Response.json(items, {
    headers: {
      // Let the CDN/browser serve a cached copy immediately and revalidate in
      // the background for a full day if the origin is slow/unavailable.
      'Cache-Control': `public, s-maxage=${CATALOGUE_REVALIDATE}, stale-while-revalidate=86400`,
    },
  })
}
