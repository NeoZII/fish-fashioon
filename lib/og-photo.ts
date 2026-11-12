/**
 * Candidate URLs for the photo in a share-preview image, best first.
 * The image renderer (satori) only reads JPEG/PNG, so for Alibaba we request a
 * resized JPEG rather than the WebP thumbnail the site uses.
 */
export function ogPhotoCandidates(src: string): string[] {
  if (!src) return []
  let url: URL
  try {
    url = new URL(src)
  } catch {
    return []
  }

  if (/(^|\.)alicdn\.com$/i.test(url.hostname)) {
    const path = url.pathname
    if (/_\d+x\d+/.test(path)) {
      // Already sized; drop a trailing "_.webp" conversion if present.
      return [`${url.origin}${path.replace(/_\.webp$/i, '')}`]
    }
    return [`${url.origin}${path}_800x800q80.jpg`, src]
  }

  if (/(^|\.)geilicdn\.com$/i.test(url.hostname)) {
    const sized = new URL(src)
    sized.searchParams.set('w', '800')
    sized.searchParams.set('h', '800')
    return [sized.toString(), src]
  }

  if (/^lh\d\.googleusercontent\.com$/i.test(url.hostname) && url.pathname.startsWith('/d/')) {
    return [`${src}=w800`, src]
  }

  return [src]
}

/** Fetch the first candidate that is a JPEG/PNG under 4 MB, as a data URI. */
export async function loadOgPhoto(src: string): Promise<string | null> {
  for (const candidate of ogPhotoCandidates(src)) {
    try {
      const res = await fetch(candidate, {
        signal: AbortSignal.timeout(5000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FashionSeaPreview/1.0)' },
      })
      if (!res.ok) continue
      const type = (res.headers.get('content-type') ?? '').split(';')[0].trim()
      if (type !== 'image/jpeg' && type !== 'image/png') continue
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length === 0 || buf.length > 4_000_000) continue
      return `data:${type};base64,${buf.toString('base64')}`
    } catch {
      // try the next candidate
    }
  }
  return null
}
