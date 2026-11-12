import type { Product } from './data'
import { itemKey } from './item-key'

/**
 * Data hygiene for the Google Sheet feed.
 *
 * The sheet is edited by hand, so typos and copy-paste mistakes creep in
 * (category spelled "LONGLSEEVES", a wrong affiliate code, a spreadsheet
 * "#VALUE!" error in the price column...). Every row passes through
 * `cleanProduct` on the server before it reaches the site, so one bad cell can
 * never hide items from a filter or send a buyer through the wrong link.
 *
 * Fixing the sheet itself is still the real fix; this layer is the safety net.
 */

/** Kakobuy affiliate code. Every Kakobuy link is forced onto this code. */
export const KAKOBUY_AFFCODE = 'dqh2u'

/** Misspellings / variants seen in the sheet, mapped to the canonical category. */
const CATEGORY_ALIASES: Record<string, string> = {
  LONGLSEEVES: 'LONGSLEEVES',
  'LONG SLEEVES': 'LONGSLEEVES',
  'LONG SLEEVE': 'LONGSLEEVES',
  LONGSLEEVE: 'LONGSLEEVES',
  'LONG-SLEEVES': 'LONGSLEEVES',
  ZIPUPS: 'ZIP-UPS',
  'ZIP UPS': 'ZIP-UPS',
  'ZIP-UP': 'ZIP-UPS',
  ZIPUP: 'ZIP-UPS',
  HOODIE: 'HOODIES',
  'T-SHIRT': 'T-SHIRTS',
  TSHIRTS: 'T-SHIRTS',
  'T SHIRTS': 'T-SHIRTS',
  TEES: 'T-SHIRTS',
  'TANK TOPS': 'TANKTOPS',
  JEWELRY: 'JEWELLERY',
  SWEATER: 'SWEATERS',
  JACKET: 'JACKETS',
  SHIRT: 'SHIRTS',
  CAP: 'CAPS',
  BELT: 'BELTS',
  BAG: 'BAGS',
  BACKPACK: 'BACKPACKS',
}

/** Brand duplicates that should be merged under one name. */
const BRAND_ALIASES: Record<string, string> = {
  MARGIELA: 'MAISON MARGIELA',
}

/** Collapse runs of whitespace (incl. line breaks) into single spaces. */
function squash(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function cleanCategory(raw: unknown): string {
  const value = squash(raw).toUpperCase()
  return CATEGORY_ALIASES[value] ?? value
}

export function cleanBrand(raw: unknown): string {
  const value = squash(raw).toUpperCase()
  return BRAND_ALIASES[value] ?? value
}

/** Spreadsheet formula errors (#VALUE!, #N/A, #REF!...) become an empty price. */
export function cleanPrice(raw: unknown): string {
  const value = squash(raw)
  return value.startsWith('#') ? '' : value
}

const IMAGE_PATH = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i
const IMAGE_HOSTS = /(^|\.)(geilicdn\.com|alicdn\.com|postimg\.cc|cloudinary\.com|googleusercontent\.com)$/i

/**
 * Validate a buy link and pin Kakobuy links to our affiliate code.
 * Returns '' when the cell isn't a usable product link (e.g. "NO LINK FOUND",
 * or an image URL pasted into the link column by mistake).
 */
export function cleanLink(raw: unknown): string {
  const value = squash(raw)
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return ''
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return ''
  if (IMAGE_HOSTS.test(url.hostname) || IMAGE_PATH.test(url.pathname)) return ''

  if (/(^|\.)kakobuy\.com$/i.test(url.hostname)) {
    // Leave correct links untouched; only rewrite a missing or wrong code.
    if (url.searchParams.get('affcode') === KAKOBUY_AFFCODE) return value
    url.searchParams.set('affcode', KAKOBUY_AFFCODE)
    url.protocol = 'https:'
    return url.toString()
  }
  return value
}

/** Normalize one raw sheet row. Returns null for rows that can't be shown. */
export function cleanProduct(row: unknown, index: number): Product | null {
  const r = (row ?? {}) as Record<string, unknown>
  // Strip stray leading punctuation left over from copy-pasting titles.
  const title = squash(r.title).replace(/^[:;,\-–—\s]+/, '')
  const link = cleanLink(r.link)
  if (!title || !link) return null

  return {
    id: squash(r.id) || String(index),
    title,
    link,
    image: squash(r.image),
    category: cleanCategory(r.category),
    brand: cleanBrand(r.brand),
    price: cleanPrice(r.price),
    seller: squash(r.seller).toUpperCase(),
    date_added: squash(r.date_added),
    key: itemKey(link, title),
  }
}

/** Normalize the whole feed, dropping rows without a title or a valid link. */
export function cleanCatalogue(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return []
  const out: Product[] = []
  raw.forEach((row, i) => {
    const product = cleanProduct(row, i)
    if (product) out.push(product)
  })
  return out
}
