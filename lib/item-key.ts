/**
 * Stable, shareable item identifiers.
 *
 * The sheet's row-based `id` shifts whenever a row above is deleted, so a link
 * built on it would silently start pointing at a different product. Instead,
 * an item's key is a hash of its buy link + title: it survives deletions,
 * re-ordering and sheet sorting, and only changes if that link or title is
 * edited (the item page then falls back to a "find similar" page).
 *
 * URL shape: /item/<readable-slug>-<key>. Only the trailing key is used for
 * lookup; the slug is for humans and link previews.
 */

/** 32-bit FNV-1a hash with a configurable seed. */
function fnv1a(input: string, seed: number): number {
  let hash = seed >>> 0
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash >>> 0
}

/** 10-character base36 key from link + title (two independent 32-bit hashes). */
export function itemKey(link: string, title: string): string {
  const source = `${link.trim()}|${title.trim().toLowerCase()}`
  const a = fnv1a(source, 0x811c9dc5).toString(36).padStart(7, '0')
  const b = fnv1a(source, 0x01234567).toString(36).padStart(7, '0')
  return (a + b).slice(0, 10)
}

/** Lowercase, ASCII-only, dash-separated slug for readable URLs. */
export function slugify(title: string, maxLength = 60): string {
  const slug = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '')
  return slug || 'item'
}

/** Path segment for an item: "<slug>-<key>". */
export function itemSlug(item: { title: string; key: string }): string {
  return `${slugify(item.title)}-${item.key}`
}

/** Site-relative URL of an item page. */
export function itemPath(item: { title: string; key: string }): string {
  return `/item/${itemSlug(item)}`
}

/** Extract the key from "/item/<slug>-<key>" (the last dash-separated part). */
export function keyFromSlug(slug: string): string {
  const decoded = decodeURIComponent(slug)
  const parts = decoded.split('-')
  return parts[parts.length - 1] ?? ''
}

/** Human words from a slug, e.g. for a "search for this" fallback. */
export function wordsFromSlug(slug: string): string {
  const parts = decodeURIComponent(slug).split('-')
  parts.pop() // drop the key
  return parts.join(' ').trim()
}
