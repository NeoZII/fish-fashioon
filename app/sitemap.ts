import type { MetadataRoute } from 'next'
import { getCatalogue } from '@/lib/catalogue'
import { itemPath } from '@/lib/item-key'
import { PRIVATE_PATHS, VIEW_PATHS } from '@/lib/sections'
import { SITE_URL } from '@/lib/site'

// Rebuilt hourly so new finds become discoverable by search engines.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sections: MetadataRoute.Sitemap = Object.values(VIEW_PATHS)
    .filter((path) => !PRIVATE_PATHS.has(path))
    .map((path) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    changeFrequency: 'daily',
    priority: path === '/' ? 1 : 0.8,
  }))

  let items: MetadataRoute.Sitemap = []
  try {
    const catalogue = await getCatalogue()
    const seen = new Set<string>()
    items = catalogue
      .filter((p) => (seen.has(p.key) ? false : (seen.add(p.key), true)))
      .map((p) => {
        const added = new Date(p.date_added)
        return {
          url: `${SITE_URL}${itemPath(p)}`,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
          ...(Number.isNaN(added.getTime()) || added.getFullYear() < 2020 ? {} : { lastModified: added }),
        }
      })
  } catch {
    // Sheet unavailable: still serve the section URLs.
  }

  return [...sections, ...items]
}
