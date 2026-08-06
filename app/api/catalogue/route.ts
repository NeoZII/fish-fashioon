/**
 * Server-side cached proxy for the Google Apps Script catalogue.
 *
 * The upstream Apps Script endpoint is slow (~10s per cold request), so we
 * fetch it here and let Next.js cache the response in its Data Cache. After
 * the first warm-up, nearly every visitor gets a fast, already-cached payload
 * instead of waiting on Google — this is what stops first-time visitors from
 * landing on an empty site.
 */
const SHEET_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwbaFyh3AHeysqlwzrk2tDMbBbKjX7onnbc0uLoN1dItZhjqiehYgMuxLotDzjQQwBo/exec'

// How long a cached copy is considered fresh before Next.js revalidates it.
const REVALIDATE_SECONDS = 300

export const revalidate = 300

export async function GET() {
  try {
    const res = await fetch(SHEET_ENDPOINT, {
      // Cache the (slow) upstream response so the expensive call happens at
      // most once per revalidation window across all users.
      next: { revalidate: REVALIDATE_SECONDS },
      // Server-side guard so a hung upstream can't tie up the request forever.
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) throw new Error(`Sheet responded ${res.status}`)

    const data = await res.json()

    return Response.json(data, {
      headers: {
        // Let the CDN/browser serve a cached copy immediately and revalidate
        // in the background for a full day if the origin is slow/unavailable.
        'Cache-Control': `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
      },
    })
  } catch (err) {
    console.log('[v0] Catalogue proxy failed:', err)
    // Return an empty list (not an error) so the client renders its normal
    // empty state rather than throwing.
    return Response.json([], { status: 200 })
  }
}
