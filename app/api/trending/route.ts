import { lastDays, redis, topItems } from '@/lib/clicks'

/**
 * Most-tapped items of the last 7 days: { enabled, items: [{ key, n }] }.
 * Cached at the edge for 10 minutes, so the database is read ~6 times an hour
 * however many people open the site.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!redis) {
    return Response.json({ enabled: false, items: [] }, { headers: { 'Cache-Control': 'public, s-maxage=600' } })
  }
  try {
    const items = await topItems(lastDays(7), 60)
    return Response.json(
      { enabled: true, items },
      { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=3600' } },
    )
  } catch (err) {
    console.log('[trending] failed:', err)
    return Response.json({ enabled: false, items: [] }, { headers: { 'Cache-Control': 'no-store' } })
  }
}
