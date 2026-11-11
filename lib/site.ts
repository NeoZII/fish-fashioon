/**
 * Absolute base URL of the site, used for link previews (Open Graph), the
 * sitemap and robots.txt. Preview deployments point at themselves so their
 * previews can be checked before merging; production uses the main domain.
 */
function resolveSiteUrl(): string {
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  return 'https://v0-fashionsea.vercel.app'
}

export const SITE_URL = resolveSiteUrl()
export const SITE_NAME = 'Fashion Sea'
export const SITE_DESCRIPTION =
  'The archive for luxury and underground fashion finds. Thousands of curated pieces from 170+ brands with direct Kakobuy links, new drops every day.'
