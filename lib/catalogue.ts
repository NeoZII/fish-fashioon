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

/**
 * Fetch + normalize the catalogue from the (slow, occasionally flaky) upstream.
 *
 * `cached` reads through the Next.js Data Cache so the expensive Apps Script
 * call runs at most once per revalidation window across all visitors. The Apps
 * Script `/exec` endpoint 302-redirects to googleusercontent.com, so we follow
 * redirects explicitly. `timeoutMs` bounds how long we are willing to block a
 * request waiting on the upstream. Any successful, non-empty result is stashed
 * as the durable last-known-good copy.
 */
async function fetchCatalogue(cached: boolean, timeoutMs: number): Promise<Product[]> {
  const res = await fetch(SHEET_ENDPOINT, {
    redirect: 'follow',
    ...(cached
      ? { next: { revalidate: CATALOGUE_REVALIDATE } }
      : { cache: 'no-store' }),
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!res.ok) throw new Error(`Sheet responded ${res.status}`)
  const items = normalizeCatalogue(await res.json())
  if (items.length) lastGood = items
  return items
}

/**
 * Resilient catalogue read. Order of preference:
 *   1. Next.js Data-Cached copy (fast, shared, refreshed every 5 min).
 *   2. A fresh uncached retry if the cached copy is empty/errored.
 *   3. The durable in-memory last-known-good copy from an earlier success.
 * Only returns [] if the sheet has NEVER been fetched successfully on this
 * server instance — in which case the client falls back to its localStorage
 * cache, so a returning visitor still sees products.
 */
export async function getCatalogue(): Promise<Product[]> {
  // Happy path: served from the Data Cache, so this is cheap on warm caches.
  // Keep the blocking window short so a hung upstream can't stall the render.
  try {
    const items = await fetchCatalogue(true, 8000)
    if (items.length) return items
    console.log('[v0] getCatalogue: cached copy empty, retrying fresh')
  } catch (err) {
    console.log('[v0] getCatalogue cached fetch failed:', err)
  }

  // The cached read gave nothing. Try one fresh request, but only fall back to
  // last-known-good rather than blocking the visitor for the full upstream time.
  try {
    const fresh = await fetchCatalogue(false, 12000)
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
