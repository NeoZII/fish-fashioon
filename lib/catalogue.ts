import { type Product } from './data'

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

/** Coerce the raw sheet rows into clean, typed products. */
export function normalizeCatalogue(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((row, i) => {
      const r = row as Record<string, unknown>
      return {
        id: String(r.id ?? i),
        title: String(r.title ?? ''),
        link: String(r.link ?? '#'),
        image: String(r.image ?? ''),
        category: String(r.category ?? '').toUpperCase(),
        brand: String(r.brand ?? ''),
        price: String(r.price ?? ''),
        seller: String(r.seller ?? ''),
        date_added: String(r.date_added ?? ''),
      }
    })
    .filter((p) => p.title)
}

/**
 * Fetch + normalize the catalogue from the (slow, occasionally flaky) upstream.
 *
 * `cached` (default) reads through the Next.js Data Cache so the expensive Apps
 * Script call runs at most once per revalidation window across all visitors.
 * When that returns nothing — a cold cache, a timeout, or a transient upstream
 * hiccup — we retry ONCE with a fresh, uncached request so a single bad
 * response can never surface as an empty catalogue. A non-OK/empty response is
 * never returned as "success", so nothing empty gets cached downstream.
 */
async function fetchCatalogue(cached: boolean): Promise<Product[]> {
  const res = await fetch(SHEET_ENDPOINT, {
    ...(cached
      ? { next: { revalidate: CATALOGUE_REVALIDATE } }
      : { cache: 'no-store' }),
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`Sheet responded ${res.status}`)
  return normalizeCatalogue(await res.json())
}

export async function getCatalogue(): Promise<Product[]> {
  try {
    const items = await fetchCatalogue(true)
    if (items.length) return items
    // Cached copy was empty — retry fresh before giving up.
    console.log('[v0] getCatalogue: cached copy empty, retrying fresh')
    return await fetchCatalogue(false)
  } catch (err) {
    console.log('[v0] getCatalogue cached fetch failed, retrying fresh:', err)
    try {
      return await fetchCatalogue(false)
    } catch (retryErr) {
      console.log('[v0] getCatalogue retry failed:', retryErr)
      return []
    }
  }
}
