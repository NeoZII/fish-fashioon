/**
 * Shareable favourites lists. A list is just the item keys in the URL
 * (/list/<key>-<key>-…), so it needs no account or database and keeps working
 * as long as the items are in the catalogue. Item keys are 10 lowercase
 * base36 characters (lib/item-key.ts), so "-" can never appear inside one.
 */

/** Most items one link carries (~1,700 characters, safe for every chat app). */
export const SHARE_LIST_MAX = 150

const KEY_RE = /^[0-9a-z]{10}$/

/** Site-relative URL of a shared list, newest favourites first. */
export function listPath(keys: string[]): string {
  return `/list/${keys.slice(0, SHARE_LIST_MAX).join('-')}`
}

/** Valid, de-duplicated keys from the URL segment (anything malformed is dropped). */
export function keysFromListParam(param: string): string[] {
  let decoded = param
  try {
    decoded = decodeURIComponent(param)
  } catch {
    // keep the raw segment
  }
  const seen = new Set<string>()
  const keys: string[] = []
  for (const part of decoded.toLowerCase().split(/[-.,_~\s]+/)) {
    if (KEY_RE.test(part) && !seen.has(part)) {
      seen.add(part)
      keys.push(part)
      if (keys.length === SHARE_LIST_MAX) break
    }
  }
  return keys
}
