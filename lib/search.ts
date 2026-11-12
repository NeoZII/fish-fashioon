import type { Product } from './data'

/**
 * Typo-tolerant search.
 *
 * Every query word must match the item (title, brand, seller or category),
 * but a match can be:
 *   - exact / prefix ("hood" → HOODIES)                       best
 *   - one typo away ("hodie", "balenciga", "margeila")        good
 *   - two typos away for long words ("chrome heats" ok)       ok
 *   - written without spaces ("chromehearts", "tshirt")       good
 *   - a common shorthand ("cdg", "lv", "nb", "ro", "erd")     good
 * Results are ranked by how well they match.
 */

/** Shorthand → words the community actually writes in titles/brands. */
const SYNONYMS: Record<string, string[]> = {
  cdg: ['comme des garcons'],
  lv: ['louis vuitton'],
  ysl: ['saint laurent', 'ysl'],
  ro: ['rick owens'],
  ch: ['chrome hearts'],
  erd: ['enfants riches deprimes'],
  mmm: ['margiela'],
  mm6: ['mm6', 'margiela'],
  jpg: ['jean paul gaultier'],
  nb: ['new balance'],
  af1: ['air force 1'],
  tn: ['air max plus', 'tn'],
  bb: ['balenciaga'],
  vw: ['vivienne westwood'],
  tee: ['tee', 't shirt', 't shirts'],
  tees: ['tee', 't shirt', 't shirts'],
  jeans: ['jeans', 'denim'],
  denim: ['denim', 'jeans'],
  zipup: ['zip up', 'zip ups'],
  zipper: ['zip up', 'zip'],
  sneakers: ['sneakers', 'shoes'],
  trainers: ['sneakers', 'shoes'],
  beanie: ['beanie', 'hats'],
  necklace: ['necklace', 'jewellery'],
  ring: ['ring', 'jewellery'],
}

/** Lowercase, strip accents and punctuation, collapse spaces. */
export function normalize(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

type Indexed = { words: string[]; joined: string; compact: string; pairs: string[] }

// Built once per catalogue array.
const indexCache = new WeakMap<Product[], Map<Product, Indexed>>()

function indexFor(items: Product[]): Map<Product, Indexed> {
  let index = indexCache.get(items)
  if (index) return index
  index = new Map()
  for (const item of items) {
    const joined = normalize(`${item.title} ${item.brand} ${item.seller} ${item.category}`)
    const words = joined.split(' ').filter(Boolean)
    const pairs: string[] = []
    for (let i = 0; i < words.length - 1; i++) pairs.push(words[i] + words[i + 1])
    index.set(item, { words, joined, compact: joined.replace(/ /g, ''), pairs })
  }
  indexCache.set(items, index)
  return index
}

/** Optimal-string-alignment distance with an early exit above `max`. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  const prev2 = new Array<number>(b.length + 1)
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = new Array<number>(b.length + 1)
    cur[0] = i
    let rowMin = cur[0]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1) // transposition ("hodoie" → "hoodie")
      }
      cur[j] = v
      if (v < rowMin) rowMin = v
    }
    if (rowMin > max) return max + 1
    for (let j = 0; j <= b.length; j++) prev2[j] = prev[j]
    prev = cur
  }
  return prev[b.length]
}

/** Allowed typos for a query word of this length. */
function allowance(len: number): number {
  if (len < 4) return 0
  if (len < 7) return 1
  return 2
}

/** Score one query word against an item (0 = no match). */
function scoreToken(token: string, doc: Indexed): number {
  // Exact word or word prefix.
  for (const w of doc.words) {
    if (w === token) return 6
    if (w.startsWith(token)) return 5
  }
  // Inside a word or across words ("chromehearts", "tshirt").
  if (token.length >= 3 && (doc.joined.includes(token) || doc.compact.includes(token))) return 4

  const max = allowance(token.length)
  if (!max) return 0

  let best = max + 1
  const candidates = token.length >= 6 ? [...doc.words, ...doc.pairs] : doc.words
  for (const w of candidates) {
    // Compare with the whole word and with its start, so "hodie" ≈ "hoodies".
    const d = Math.min(
      editDistance(token, w, max),
      w.length > token.length ? editDistance(token, w.slice(0, token.length), max) : max + 1,
    )
    if (d < best) best = d
    if (best === 1 && max === 1) break
  }
  if (best > max) return 0
  return best === 1 ? 3 : 2
}

/** Best score of one query word (or any of its synonym phrases) for an item. */
function scoreGroup(alternatives: string[], doc: Indexed): number {
  let best = 0
  for (const alt of alternatives) {
    const parts = alt.split(' ')
    let s = 0
    for (const p of parts) {
      const ps = scoreToken(p, doc)
      if (!ps) {
        s = 0
        break
      }
      s += ps
    }
    if (s) s = s / parts.length
    if (s > best) best = s
  }
  return best
}

/** Scores at or above this are exact/prefix/substring matches, below are typo matches. */
const EXACT = 4

/** Split a query into words, each with its synonym alternatives. */
function parseQuery(query: string): string[][] {
  return normalize(query)
    .split(' ')
    .filter(Boolean)
    .map((t) => [t, ...(SYNONYMS[t] ?? []).map(normalize)])
}

/**
 * Filter + rank items for a query. Returns the input untouched for an empty
 * query; otherwise best matches first (ties keep the input order).
 */
export function searchItems(items: Product[], query: string): Product[] {
  const groups = parseQuery(query)
  if (!groups.length) return items
  const index = indexFor(items)

  // Pass 1: score every query word against every item.
  const perItem: { item: Product; scores: number[]; i: number }[] = []
  const hasExact = groups.map(() => false)
  items.forEach((item, i) => {
    const doc = index.get(item)
    if (!doc) return
    const scores = groups.map((g) => scoreGroup(g, doc))
    if (scores.some((sc) => sc === 0)) return
    scores.forEach((sc, g) => {
      if (sc >= EXACT) hasExact[g] = true
    })
    perItem.push({ item, scores, i })
  })

  // Pass 2: if a word was found as typed somewhere, don't also show typo
  // look-alikes for it ("bape" shouldn't pull in "cape" / "tape").
  const ranked = perItem
    .filter(({ scores }) => scores.every((sc, g) => !hasExact[g] || sc >= EXACT))
    .map(({ item, scores, i }) => ({ item, i, score: scores.reduce((a, b) => a + b, 0) }))
  ranked.sort((a, b) => b.score - a.score || a.i - b.i)
  return ranked.map((r) => r.item)
}

/**
 * Does a short label (a brand or seller name) match what someone typed?
 * Same rules as the main search: substring, typos, and shorthand both ways
 * ("rick" finds the brand "RO", "ro" finds "RICK OWENS").
 */
export function labelMatches(label: string, query: string, allowTypos = true): boolean {
  const q = normalize(query)
  if (!q) return true
  const l = normalize(label)
  // Very short queries ("nb", "lv") only match the start of a word, not the middle.
  if (q.length < 3) {
    if (l.split(' ').some((w) => w.startsWith(q))) return true
  } else if (l.includes(q) || l.replace(/ /g, '').includes(q.replace(/ /g, ''))) {
    return true
  }

  // Shorthand: the typed text is part of an expansion whose short form is this label.
  for (const [short, expansions] of Object.entries(SYNONYMS)) {
    if (l === short && expansions.some((e) => normalize(e).includes(q))) return true
    if (q === short && expansions.some((e) => l.includes(normalize(e)))) return true
  }

  // Typos, word by word.
  const max = allowTypos ? allowance(q.length) : 0
  if (!max) return false
  return l.split(' ').some(
    (w) =>
      editDistance(q, w, max) <= max ||
      (w.length > q.length && editDistance(q, w.slice(0, q.length), max) <= max),
  )
}
