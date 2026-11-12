import type { Product } from './data'

/**
 * "More like this": same category first, ranked by shared brand and seller,
 * then newest. Deterministic so the cached item page is stable.
 */
export function similarItems(items: Product[], item: Product, limit = 8): Product[] {
  const seen = new Set<string>([item.key])
  const ts = (p: Product) => {
    const t = new Date(p.date_added).getTime()
    return Number.isNaN(t) ? 0 : t
  }
  return items
    .filter((p) => p.category === item.category && p.category !== '')
    .map((p) => ({
      p,
      score: (p.brand && p.brand === item.brand ? 2 : 0) + (p.seller && p.seller === item.seller ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || ts(b.p) - ts(a.p))
    .map(({ p }) => p)
    .filter((p) => {
      if (seen.has(p.key)) return false
      seen.add(p.key)
      return true
    })
    .slice(0, limit)
}
