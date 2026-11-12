/**
 * Absolute base URL of the site, used for link previews (Open Graph), the
 * canonical URL, the sitemap and robots.txt.
 *
 * Production is pinned to the public domain on purpose: Vercel's own
 * "production URL" variable picks the project's shortest domain, which could
 * be a catalyst-*.vercel.app alias instead of the address people share.
 * Set NEXT_PUBLIC_SITE_URL in Vercel when moving to a custom domain.
 * Preview deployments point at themselves so their previews can be checked.
 */
const PRODUCTION_URL = 'https://v0-fashionsea.vercel.app'

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')
  }
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return PRODUCTION_URL
}

export const SITE_URL = resolveSiteUrl()
export const SITE_NAME = 'Fashion Sea'
export const SITE_DESCRIPTION =
  'The archive for luxury and underground fashion finds. Thousands of curated pieces from 170+ brands with direct Kakobuy links, new drops every day.'
