/**
 * Right-sized product image URLs.
 *
 * The sheet links to original photos (often 2000–4000 px, 150–400 KB) that are
 * shown at ~170–300 px. The big hosts can resize on the fly, so we ask them for
 * a thumbnail instead. Tested against the live catalogue:
 *   - Alibaba CDN (img./cbu01./gw./g-search*.alicdn.com): "_580x580q75.jpg_.webp"
 *     suffix → e.g. 179 KB → 6 KB, aspect ratio kept.
 *   - Weidian (si.geilicdn.com): ?w=&h=&q= query params.
 *   - Google (lh3.googleusercontent.com/d/<id>): "=w<size>" suffix.
 * Every other host is returned unchanged. Components fall back to the original
 * URL if a thumbnail fails to load (see components/product-image.tsx).
 */

export type ThumbSize = 580 | 800

const ALICDN = /(^|\.)alicdn\.com$/i
const ALICDN_SIZED = /_\d+x\d+/ // already has a size suffix
const GEILICDN = /(^|\.)geilicdn\.com$/i
const GOOGLE = /^lh\d\.googleusercontent\.com$/i

export function thumbUrl(src: string, size: ThumbSize = 580): string {
  if (!src) return src
  let url: URL
  try {
    url = new URL(src)
  } catch {
    return src
  }

  if (ALICDN.test(url.hostname)) {
    if (ALICDN_SIZED.test(url.pathname)) return src
    return `${url.origin}${url.pathname}_${size}x${size}q75.jpg_.webp`
  }

  if (GEILICDN.test(url.hostname)) {
    const current = Number(url.searchParams.get('w'))
    if (current && current <= size) return src
    url.searchParams.set('w', String(size))
    url.searchParams.set('h', String(size))
    url.searchParams.set('q', '75')
    return url.toString()
  }

  if (GOOGLE.test(url.hostname) && url.pathname.startsWith('/d/') && !url.pathname.includes('=')) {
    return `${src}=w${size}`
  }

  return src
}
