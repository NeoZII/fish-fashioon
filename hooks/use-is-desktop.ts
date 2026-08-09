'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true only once we've confirmed (client-side) that the viewport is at
 * least `minWidth` wide. Starts false so server render and mobile never mount
 * desktop-only, image-heavy UI — the caller can `return null` on mobile to
 * avoid loading those assets entirely.
 */
export function useIsDesktop(minWidth = 768) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`)
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [minWidth])

  return isDesktop
}
