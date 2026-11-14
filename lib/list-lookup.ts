import { cache } from 'react'
import { getCatalogue } from './catalogue'
import type { Product } from './data'
import { keysFromListParam } from './share-list'

/**
 * Resolve a shared list URL segment to products, in the list's order.
 * Throws when the catalogue itself is unavailable, so a sheet hiccup is never
 * cached as "every item in this list is gone".
 */
export const findListItems = cache(
  async (param: string): Promise<{ keys: string[]; items: Product[]; missing: number }> => {
    const keys = keysFromListParam(param)
    if (!keys.length) return { keys, items: [], missing: 0 }
    const catalogue = await getCatalogue()
    if (!catalogue.length) throw new Error('Catalogue temporarily unavailable')
    const byKey = new Map<string, Product>()
    for (const p of catalogue) if (!byKey.has(p.key)) byKey.set(p.key, p)
    const items = keys.map((k) => byKey.get(k)).filter((p): p is Product => Boolean(p))
    return { keys, items, missing: keys.length - items.length }
  },
)
