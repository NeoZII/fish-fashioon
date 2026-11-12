'use client'

import { useState, type ImgHTMLAttributes } from 'react'
import { thumbUrl, type ThumbSize } from '@/lib/image'

const PLACEHOLDER = '/placeholder.svg'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError' | 'onLoad'> & {
  src: string
  size?: ThumbSize
}

/**
 * Product photo with a resized thumbnail and graceful fallbacks:
 * thumbnail → original URL → placeholder.
 *
 * `referrerPolicy="no-referrer"` matters: 1688 (cbu01.alicdn.com) refuses
 * hotlinked images when the request says it comes from our site, and returns
 * them fine without a referrer. Tested on the live catalogue.
 */
export function ProductImage({ src, size = 580, alt = '', loading = 'lazy', ...rest }: Props) {
  const thumb = src ? thumbUrl(src, size) : PLACEHOLDER
  const [state, setState] = useState({ for: src, current: thumb })

  // Reset when the same <img> is reused for a different product.
  if (state.for !== src) setState({ for: src, current: thumb })
  const current = state.for === src ? state.current : thumb

  const fallback = () => {
    if (current !== src && src) setState({ for: src, current: src })
    else if (current !== PLACEHOLDER) setState({ for: src, current: PLACEHOLDER })
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={current}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={fallback}
      onLoad={(e) => {
        // Some CDNs answer an unsupported resize with a 1×1 pixel.
        if (e.currentTarget.naturalWidth <= 1) fallback()
      }}
    />
  )
}
