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
 * Fetch + normalize the catalogue on the server through the Next.js Data Cache.
 * The expensive upstream call runs at most once per revalidation window across
 * all visitors; `stale-while-revalidate` keeps serving the last good copy for a
 * day if Google is slow or down. Returns [] only if there is no cached copy at
 * all — the client then falls back to its localStorage cache.
 */
export async function getCatalogue(): Promise<Product[]> {
  try {
    const res = await fetch(SHEET_ENDPOINT, {
      next: { revalidate: CATALOGUE_REVALIDATE },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`Sheet responded ${res.status}`)
    return normalizeCatalogue(await res.json())
  } catch (err) {
    console.log('[v0] getCatalogue failed:', err)
    return []
  }
}
