import { gunzipSync, gzipSync } from 'node:zlib'
import { unstable_cache } from 'next/cache'
import { type Product } from './data'
import { cleanCatalogue } from './clean-catalogue'

/**
 * Live Google Apps Script deployment feeding the catalogue. Columns in order:
 * A id, B title, C link, D image, E category, F brand, G price, H seller,
 * I date_added. The endpoint is slow (~10s cold), so every consumer here goes
 * through Next.js caching rather than hitting Google on each request.
 */
const SHEET_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwbaFyh3AHeysqlwzrk2tDMbBbKjX7onnbc0uLoN1dItZhjqiehYgMuxLotDzjQQwBo/exec'

/** How long a cached copy is fresh before Next.js revalidates it. */
export const CATALOGUE_REVALIDATE = 300

/**
 * Durable last-known-good catalogue held in module memory. It survives across
 * every request served by a warm server instance, so once we have fetched the
 * sheet successfully even once, later requests keep returning products even if
 * the (flaky) upstream later hangs or 302-loops. This is the safety net that
 * prevents the "no products" blank page during an upstream outage.
 */
let lastGood: Product[] = []

/** Coerce the raw sheet rows into clean, typed products (see clean-catalogue.ts). */
export const normalizeCatalogue = cleanCatalogue

/** One request to the sheet, never cached by Next.js itself (see below). */
async function fetchSheet(timeoutMs: number): Promise<Product[]> {
  const res = await fetch(SHEET_ENDPOINT, {
    redirect: 'follow',
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!res.ok) throw new Error(`Sheet responded ${res.status}`)
  const items = normalizeCatalogue(await res.json())
  if (items.length) lastGood = items
  return items
}

/**
 * The shared, cached copy: the cleaned catalogue, gzipped and base64-encoded.
 *
 * Why packed: Next.js refuses to cache anything over 2 MB, and it stores a
 * fetched response base64-encoded (+33%). Once the sheet passed ~1.57 MB
 * (3,857 items, 25 Nov 2026) the raw response no longer fit, so the cache kept
 * serving the old copy forever while every visit re-downloaded the sheet.
 * Packed, ~1.6 MB of JSON is ~300 KB, which leaves room for 15,000+ items.
 *
 * Refreshed in the background every CATALOGUE_REVALIDATE seconds; if a
 * refresh fails (throws), the previous copy keeps being served.
 */
const packedCatalogue = unstable_cache(
  async (): Promise<string> => {
    const items = await fetchSheet(25000)
    // Never cache an empty catalogue: throwing keeps the previous copy.
    if (!items.length) throw new Error('Sheet returned no items')
    return gzipSync(JSON.stringify(items)).toString('base64')
  },
  ['sheet-catalogue-gzip-v1'],
  { revalidate: CATALOGUE_REVALIDATE },
)

async function cachedCatalogue(): Promise<Product[]> {
  const packed = await packedCatalogue()
  const items = JSON.parse(gunzipSync(Buffer.from(packed, 'base64')).toString('utf8')) as Product[]
  if (items.length) lastGood = items
  return items
}

/**
 * Resilient catalogue read. Order of preference:
 *   1. The shared cached copy (packed, refreshed every 5 min in the background).
 *   2. A fresh uncached retry if the cached copy is empty/errored.
 *   3. The durable in-memory last-known-good copy from an earlier success.
 * Only returns [] if the sheet has NEVER been fetched successfully on this
 * server instance. The API route then answers 503 (never cached) and the
 * client retries, while the CDN keeps serving its last good copy.
 */
export async function getCatalogue(): Promise<Product[]> {
  // Happy path: served from the Data Cache, so this is cheap on warm caches.
  // Keep the blocking window short so a hung upstream can't stall the render.
  try {
    const items = await cachedCatalogue()
    if (items.length) return items
    console.log('[v0] getCatalogue: cached copy empty, retrying fresh')
  } catch (err) {
    console.log('[v0] getCatalogue cached fetch failed:', err)
  }

  // The cached read gave nothing. Try one fresh request, but only fall back to
  // last-known-good rather than blocking the visitor for the full upstream time.
  try {
    const fresh = await fetchSheet(12000)
    if (fresh.length) return fresh
  } catch (retryErr) {
    console.log('[v0] getCatalogue fresh retry failed:', retryErr)
  }

  // Upstream is currently unreachable/slow. Serve the last good copy if we have
  // one so the site never blanks out during an outage.
  if (lastGood.length) {
    console.log('[v0] getCatalogue: serving last-known-good copy')
    return lastGood
  }

  console.log('[v0] getCatalogue: no data available yet')
  return []
}
