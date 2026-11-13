export type ViewId = 'menu' | 'drops' | 'archive' | 'sellers' | 'manifesto' | 'socials' | 'countdown' | 'favourites'

export type MenuItem = {
  id: Exclude<ViewId, 'menu'>
  label: string
  index: string
  sub: string
  fontSize: number
  skewX: number
  skewY: number
  offsetX: number
  /** Show a small "NEW" sticker next to the label. */
  badge?: string
  /** Render the label in a glowing red treatment to grab attention. */
  glowRed?: boolean
  /** Tint the label slightly red (softer than glowRed). */
  redAccent?: boolean
  /** Hot-pink "favourites" treatment: glowing label, heart, pink highlight slab. */
  glowFav?: boolean
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'drops',
    label: 'LATEST DROPS',
    index: '01',
    sub: 'THE FEED',
    fontSize: 70,
    skewX: -7,
    skewY: 6,
    offsetX: 0,
    badge: 'NEW',
  },
  {
    id: 'archive',
    label: 'ALL ITEMS',
    index: '02',
    sub: 'THE GALLERY',
    fontSize: 74,
    skewX: -11,
    skewY: -8,
    offsetX: 34,
    glowRed: true,
  },
  {
    id: 'sellers',
    label: 'SELLERS',
    index: '03',
    sub: 'THE PLUGS',
    fontSize: 72,
    skewX: -5,
    skewY: 5,
    offsetX: 12,
  },
  {
    id: 'manifesto',
    label: 'HOW TO BUY',
    index: '04',
    sub: 'THE TUTORIAL',
    fontSize: 54,
    skewX: -4,
    skewY: 7,
    offsetX: 20,
    glowRed: true,
  },
  {
    id: 'socials',
    label: 'SOCIALS',
    index: '05',
    sub: 'THE NETWORK',
    fontSize: 72,
    skewX: -9,
    skewY: -5,
    offsetX: 28,
  },
  {
    id: 'favourites',
    label: 'MY FAVOURITES',
    index: '06',
    sub: 'THE STASH',
    fontSize: 54,
    skewX: -6,
    skewY: 4,
    offsetX: 10,
    glowFav: true,
  },
]

/**
 * The shape of a single row coming out of the Google Sheet / Apps Script feed.
 * Sheet columns (in order): A id, B title, C link, D image, E category,
 * F brand, G price, H seller, I date_added.
 */
export type Product = {
  id: string
  title: string
  link: string
  image: string
  category: string
  brand: string
  price: string
  seller: string
  date_added: string
  /** Stable shareable key (hash of link + title), see lib/item-key.ts. */
  key: string
}

export const CATEGORIES = [
  'ALL',
  'PANTS',
  'SWEATPANTS',
  'SHORTS',
  'HOODIES',
  'ZIP-UPS',
  'JACKETS',
  'COATS',
  'SWEATS',
  'SWEATERS',
  'T-SHIRTS',
  'LONGSLEEVES',
  'TANKTOPS',
  'SHIRTS',
  'JERSEYS',
  'SETS',
  'SHOES',
  'BOOTS',
  'SLIDES',
  'MERCH',
  'ACCESSORIES',
  'CAPS',
  'HATS',
  'SCARVES',
  'GLOVES',
  'BELTS',
  'BAGS',
  'BACKPACKS',
  'JEWELLERY',
  'TECH',
  'FIGURINES',
] as const

/**
 * Category chips for a set of items: "ALL" first, then every category that
 * actually has items, in the canonical CATEGORIES order. Categories that exist
 * in the sheet but aren't in CATEGORIES yet are appended alphabetically, so a
 * new category can never be unreachable, and empty chips never show.
 */
export function categoryFilters(items: Product[]): string[] {
  const present = new Set(items.map((i) => i.category).filter(Boolean))
  const known = CATEGORIES.filter((c) => c !== 'ALL' && present.has(c))
  const knownSet = new Set<string>(known)
  const extras = Array.from(present)
    .filter((c) => !knownSet.has(c))
    .sort((a, b) => a.localeCompare(b))
  return ['ALL', ...known, ...extras]
}

/** Derive a filter list of unique sellers, always led by "ALL". */
export function sellerFilters(items: Product[]): string[] {
  const unique = Array.from(new Set(items.map((i) => i.seller).filter(Boolean)))
  return ['ALL', ...unique]
}

/** Derive a filter list of unique brands (column F), always led by "ALL". */
export function brandFilters(items: Product[]): string[] {
  const unique = Array.from(new Set(items.map((i) => i.brand).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  )
  return ['ALL', ...unique]
}

export type Social = {
  id: string
  label: string
  handle: string
  meta: string
  href: string
  comingSoon?: boolean
}

export const SOCIALS: Social[] = [
  { id: 's1', label: 'TIKTOK', handle: '@bikinibottomsfashion', meta: '', href: 'https://www.tiktok.com/@bikinibottomsfashion' },
  { id: 's2', label: 'INSTAGRAM', handle: '@bikinibottomsfashion', meta: '', href: 'https://www.instagram.com/bikinibottomsfashion?igsh=MWFteDVwZDl5MG5scg%3D%3D&utm_source=qr' },
  { id: 's3', label: 'DISCORD', handle: 'discord.gg/q2EJG25Ebc', meta: '', href: 'https://discord.gg/q2EJG25Ebc' },
  { id: 's4', label: 'REDDIT', handle: '', meta: 'COMING SOON', href: '#', comingSoon: true },
]

/** Dates on or before this are sheet placeholders, not real "added" dates. */
const PLACEHOLDER_DATE_FLOOR = new Date('2020-01-01T00:00:00').getTime()
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

/** Items added in the last 7 days, newest first (the Latest Drops feed). */
export function recentItems(items: Product[], now: number = Date.now()): Product[] {
  return items
    .map((item) => ({ item, ts: new Date(item.date_added).getTime() }))
    .filter(({ ts }) => !Number.isNaN(ts) && ts > PLACEHOLDER_DATE_FLOOR && now - ts <= SEVEN_DAYS_MS)
    .sort((a, b) => b.ts - a.ts)
    .map(({ item }) => item)
}
