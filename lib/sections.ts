import type { ViewId } from './data'

/** Public URL of each view. The menu lives at the site root. */
export const VIEW_PATHS: Record<ViewId, string> = {
  menu: '/',
  drops: '/latest',
  archive: '/all',
  sellers: '/sellers',
  manifesto: '/how-to-buy',
  socials: '/socials',
  countdown: '/burberry',
}

/** Section slugs that get their own page (everything except the menu). */
export const SECTION_SLUGS = Object.values(VIEW_PATHS)
  .filter((p) => p !== '/')
  .map((p) => p.slice(1))

export function viewFromPath(pathname: string): ViewId | null {
  const clean = pathname.replace(/\/+$/, '') || '/'
  const entry = (Object.entries(VIEW_PATHS) as [ViewId, string][]).find(([, path]) => path === clean)
  return entry ? entry[0] : null
}

/** Title + description per section, used for link previews and search results. */
export const SECTION_META: Record<Exclude<ViewId, 'menu'>, { title: string; description: string }> = {
  drops: {
    title: 'Latest Drops',
    description: 'Everything added to Fashion Sea in the last 7 days, with direct Kakobuy links. Updated daily.',
  },
  archive: {
    title: 'All Items',
    description: 'Every find on Fashion Sea: thousands of pieces from 170+ brands, filter by category and brand.',
  },
  sellers: {
    title: 'Sellers',
    description: 'Shop Fashion Sea finds by seller: every plug in one place.',
  },
  manifesto: {
    title: 'How to Buy',
    description: 'Step-by-step guide to ordering with Kakobuy, from account to doorstep. Unlock the coupons first.',
  },
  socials: {
    title: 'Socials',
    description: 'Fashion Sea on TikTok, Instagram and Discord.',
  },
  countdown: {
    title: 'Burberry Puffer Links',
    description: 'Burberry puffer links in black, white and purple.',
  },
}
