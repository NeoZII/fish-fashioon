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
    redAccent: true,
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
  'JEANS',
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
  'BAGS',
  'BACKPACKS',
  'JEWELLERY',
  'FIGURINES',
] as const

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

/**
 * Fallback catalogue used while the live sheet is unreachable (e.g. in preview
 * before the Apps Script endpoint is wired up). Uses the generated gothic
 * imagery so the grids never render empty.
 */
export const FALLBACK_ITEMS: Product[] = [
  { id: '1', title: 'MIDNIGHT RITUAL HOODIE', link: '#', image: '/drops/drop-01.png', category: 'HOODIES', brand: 'FishFashion', price: '$180', seller: 'PainterMade', date_added: '2026-07-25' },
  { id: '2', title: 'BLUE HOUR TRACK PANT', link: '#', image: '/drops/drop-02.png', category: 'SWEATPANTS', brand: 'RICHILL', price: '$140', seller: 'Richill', date_added: '2026-07-24' },
  { id: '3', title: 'CHROME & LEATHER JACKET', link: '#', image: '/drops/drop-03.png', category: 'OUTERWEAR', brand: 'VOID CO.', price: '$420', seller: 'VoidCo', date_added: '2026-07-22' },
  { id: '4', title: 'CONCRETE SKY DENIM', link: '#', image: '/drops/drop-04.png', category: 'JEANS', brand: 'FishFashion', price: '$210', seller: 'PainterMade', date_added: '2026-07-20' },
  { id: '5', title: 'FRACTURE TEE', link: '#', image: '/archive/arc-01.png', category: 'T-SHIRTS', brand: 'RICHILL', price: '$65', seller: 'Richill', date_added: '2026-06-30' },
  { id: '6', title: 'STATIC SMOKE CREW', link: '#', image: '/archive/arc-02.png', category: 'SWEATS', brand: 'VOID CO.', price: '$120', seller: 'VoidCo', date_added: '2026-06-12' },
  { id: '7', title: 'SPLIT PORTRAIT CAP', link: '#', image: '/archive/arc-03.png', category: 'HEADWEAR', brand: 'FishFashion', price: '$55', seller: 'PainterMade', date_added: '2026-05-01' },
  { id: '8', title: 'THE HOODED ONE SHIRT', link: '#', image: '/drops/drop-01.png', category: 'SHIRTS', brand: 'RICHILL', price: '$95', seller: 'Richill', date_added: '2026-07-19' },
  { id: '9', title: 'NEON SILHOUETTE BOOT', link: '#', image: '/drops/drop-02.png', category: 'FOOTWEAR', brand: 'VOID CO.', price: '$320', seller: 'VoidCo', date_added: '2026-04-18' },
  { id: '10', title: 'ASCENT CHAIN', link: '#', image: '/drops/drop-04.png', category: 'ACCESSORIES', brand: 'FishFashion', price: '$90', seller: 'PainterMade', date_added: '2020-01-01' },
  { id: '11', title: 'RITUAL SWEATPANT', link: '#', image: '/archive/arc-01.png', category: 'SWEATPANTS', brand: 'RICHILL', price: '$135', seller: 'Richill', date_added: '2026-03-09' },
  { id: '12', title: 'VOID SHELL COAT', link: '#', image: '/drops/drop-03.png', category: 'OUTERWEAR', brand: 'VOID CO.', price: '$460', seller: 'VoidCo', date_added: '2026-07-26' },
]

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
  { id: 's3', label: 'DISCORD', handle: '', meta: 'COMING SOON', href: '#', comingSoon: true },
  { id: 's4', label: 'REDDIT', handle: '', meta: 'COMING SOON', href: '#', comingSoon: true },
]
