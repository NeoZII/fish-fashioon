export type ViewId = 'menu' | 'drops' | 'archive' | 'sellers' | 'manifesto' | 'socials'

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
    label: 'THE ARCHIVE',
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
}

export const CATEGORIES = [
  'ALL',
  'PANTS',
  'SWEATPANTS',
  'SHORTS',
  'HOODIES',
  'ZIP-UPS',
  'JACKETS',
  'SWEATS',
  'T-SHIRTS',
  'LONGSLEEVES',
  'TANKTOPS',
  'SHIRTS',
  'JERSEYS',
  'SHOES',
  'BOOTS',
  'SLIDES',
  'MERCH',
  'ACCESSORIES',
  'CAPS',
  'BELTS',
  'BAGS',
  'BACKPACKS',
  'JEWELLERY',
  'FIGURINES',
] as const

/**
 * Case-insensitive live-search match. Checks the title/name plus brand and
 * seller so a query like "Dior" or "Nike" surfaces relevant hits even when the
 * term isn't in the title. An empty query matches everything.
 */
export function matchesQuery(item: Product, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    item.title.toLowerCase().includes(q) ||
    item.brand.toLowerCase().includes(q) ||
    item.seller.toLowerCase().includes(q)
  )
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
