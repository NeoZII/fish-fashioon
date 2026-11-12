import { cache } from 'react'
import { getCatalogue } from './catalogue'
import type { Product } from './data'
import { keyFromSlug } from './item-key'

/**
 * Look up an item by its URL slug. Throws (instead of returning "not found")
 * when the catalogue itself is unavailable, so an upstream hiccup is never
 * cached as a 404 for a real product.
 */
export const findItemBySlug = cache(
  async (slug: string): Promise<{ items: Product[]; item: Product | null }> => {
    const items = await getCatalogue()
    if (!items.length) throw new Error('Catalogue temporarily unavailable')
    const key = keyFromSlug(slug)
    return { items, item: items.find((i) => i.key === key) ?? null }
  },
)
