import type { Product } from './data'
import { itemPath } from './item-key'
import { parsePrice } from './price'
import { SITE_NAME, SITE_URL } from './site'

/**
 * schema.org data (JSON-LD) for search engines: what a page is about, in a
 * form they can read without guessing from the layout.
 *
 * Deliberately no `brand` property: titles already name what the item is, and
 * the site lists finds, not official brand products.
 */

type Json = Record<string, unknown>

/** Serialize for a <script type="application/ld+json">: `<` escaped so text can't close the tag. */
export function jsonLd(data: Json): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/** "$101.99" / "$1,234.50" → "101.99" / "1234.50"; null when there's no dollar price. */
function usdAmount(price: string): string | null {
  const { usd } = parsePrice(price)
  if (!usd.startsWith('$')) return null
  const n = Number(usd.slice(1).replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? n.toFixed(2) : null
}

function absoluteImage(src: string): string | undefined {
  try {
    const u = new URL(src)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : undefined
  } catch {
    return undefined
  }
}

/** One item page: a Product with its price, linked to the item page. */
export function productLd(item: Product): Json {
  const url = `${SITE_URL}${itemPath(item)}`
  const price = usdAmount(item.price)
  const image = absoluteImage(item.image)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    url,
    ...(image ? { image } : {}),
    ...(item.category ? { category: item.category } : {}),
    ...(price
      ? {
          offers: {
            '@type': 'Offer',
            price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url,
          },
        }
      : {}),
  }
}

/** A page that lists items (a week, a shared list): the first `max` as an ItemList. */
export function itemListLd(name: string, pageUrl: string, items: Product[], max = 100): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: pageUrl,
    numberOfItems: items.length,
    itemListElement: items.slice(0, max).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}${itemPath(p)}`,
      name: p.title,
    })),
  }
}

/** The site itself (home page). */
export function websiteLd(): Json {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: SITE_URL }
}
