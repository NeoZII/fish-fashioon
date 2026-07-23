export type ViewId = 'menu' | 'drops' | 'archive' | 'manifesto' | 'network'

export type MenuItem = {
  id: Exclude<ViewId, 'menu'>
  label: string
  index: string
  sub: string
  fontSize: number
  skewX: number
  skewY: number
  offsetX: number
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'drops',
    label: 'LATEST DROPS',
    index: '01',
    sub: 'THE FEED',
    fontSize: 72,
    skewX: -7,
    skewY: 6,
    offsetX: 0,
  },
  {
    id: 'archive',
    label: 'THE ARCHIVE',
    index: '02',
    sub: 'THE GALLERY',
    fontSize: 78,
    skewX: -11,
    skewY: -8,
    offsetX: 34,
  },
  {
    id: 'manifesto',
    label: 'MANIFESTO',
    index: '03',
    sub: 'WHO WE ARE',
    fontSize: 70,
    skewX: -4,
    skewY: 7,
    offsetX: 14,
  },
  {
    id: 'network',
    label: 'NETWORK',
    index: '04',
    sub: 'THE SOCIALS',
    fontSize: 74,
    skewX: -9,
    skewY: -5,
    offsetX: 24,
  },
]

export type Drop = {
  id: string
  title: string
  handle: string
  views: string
  likes: string
  tag: string
  image: string
}

export const DROPS: Drop[] = [
  {
    id: 'd1',
    title: 'MIDNIGHT RITUAL',
    handle: '@nox.persona',
    views: '2.4M',
    likes: '312K',
    tag: 'DROP',
    image: '/drops/drop-01.png',
  },
  {
    id: 'd2',
    title: 'BLUE HOUR',
    handle: '@nox.persona',
    views: '1.1M',
    likes: '188K',
    tag: 'BTS',
    image: '/drops/drop-02.png',
  },
  {
    id: 'd3',
    title: 'CHROME & LEATHER',
    handle: '@nox.persona',
    views: '904K',
    likes: '96K',
    tag: 'DROP',
    image: '/drops/drop-03.png',
  },
  {
    id: 'd4',
    title: 'CONCRETE SKY',
    handle: '@nox.persona',
    views: '3.7M',
    likes: '441K',
    tag: 'FILM',
    image: '/drops/drop-04.png',
  },
  {
    id: 'd5',
    title: 'FRACTURE',
    handle: '@nox.persona',
    views: '812K',
    likes: '77K',
    tag: 'DROP',
    image: '/archive/arc-01.png',
  },
  {
    id: 'd6',
    title: 'STATIC SMOKE',
    handle: '@nox.persona',
    views: '1.9M',
    likes: '260K',
    tag: 'LIVE',
    image: '/archive/arc-02.png',
  },
]

export type ArchiveItem = {
  id: string
  title: string
  year: string
  image: string
}

export const ARCHIVE: ArchiveItem[] = [
  { id: 'a1', title: 'FRACTURED MARBLE', year: '2024', image: '/archive/arc-01.png' },
  { id: 'a2', title: 'ELECTRIC SMOKE', year: '2024', image: '/archive/arc-02.png' },
  { id: 'a3', title: 'SPLIT PORTRAIT', year: '2023', image: '/archive/arc-03.png' },
  { id: 'a4', title: 'THE HOODED ONE', year: '2023', image: '/drops/drop-01.png' },
  { id: 'a5', title: 'NEON SILHOUETTE', year: '2022', image: '/drops/drop-02.png' },
  { id: 'a6', title: 'CONCRETE ASCENT', year: '2022', image: '/drops/drop-04.png' },
]

export type Social = {
  id: string
  label: string
  handle: string
  meta: string
  href: string
}

export const SOCIALS: Social[] = [
  { id: 's1', label: 'TIKTOK', handle: '@nox.persona', meta: '2.1M FOLLOWERS', href: '#' },
  { id: 's2', label: 'INSTAGRAM', handle: '@nox.persona', meta: '840K FOLLOWERS', href: '#' },
  { id: 's3', label: 'YOUTUBE', handle: '/noxpersona', meta: '512K SUBS', href: '#' },
  { id: 's4', label: 'X / TWITTER', handle: '@noxpersona', meta: '204K FOLLOWERS', href: '#' },
]
