'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/lib/data'
import { useIsDesktop } from '@/hooks/use-is-desktop'

const ADVANCE_MS = 3800

/**
 * Auto-rotating product image slideshow pinned to the right edge of the menu.
 * Desktop only — it returns null on mobile (via useIsDesktop) so none of the
 * product images are ever requested on phones.
 */
export function ProductSlideshow({ items }: { items: Product[] }) {
  const isDesktop = useIsDesktop()

  // Stable pool of items that actually have an image, capped so we don't cycle
  // through thousands of entries.
  const slides = useMemo(
    () => items.filter((i) => i.image && i.image.trim() !== '').slice(0, 40),
    [items],
  )

  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!isDesktop || slides.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [isDesktop, slides.length])

  // Don't render (or load any images) unless we're on desktop with content.
  if (!isDesktop || slides.length === 0) return null

  const current = slides[index % slides.length]

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-16 top-1/2 z-10 hidden aspect-[3/4] w-[300px] -translate-y-1/2 lg:right-24 lg:block"
      style={{ transform: 'translateY(-50%) skewX(-4deg)' }}
    >
      {/* accent frame */}
      <div className="absolute -inset-3 border border-primary/30" />
      <div className="relative h-full w-full overflow-hidden bg-card">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={current.id + index}
            src={current.image || '/placeholder.svg'}
            alt=""
            crossOrigin="anonymous"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* dark gradient + caption */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id + '-cap'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-1"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                {current.brand || 'ARCHIVE'}
              </span>
              <span className="line-clamp-1 font-display text-lg italic leading-none text-foreground">
                {current.title}
              </span>
              {current.price ? (
                <span className="font-mono text-xs text-muted-foreground">{current.price}</span>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
