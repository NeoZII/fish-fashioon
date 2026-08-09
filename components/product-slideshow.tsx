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
export function ProductSlideshow({
  items,
  onOpenArchive,
}: {
  items: Product[]
  onOpenArchive?: () => void
}) {
  const isDesktop = useIsDesktop()

  // Randomized pool of SELLERS-section items (those with a non-empty seller,
  // same rule as the Sellers view) that actually have an image. Shuffled once
  // so the slideshow order isn't the sheet's seller ordering, then capped so we
  // don't cycle through thousands of entries.
  const slides = useMemo(() => {
    const pool = items.filter(
      (i) => i.seller.trim() !== '' && i.image && i.image.trim() !== '',
    )
    // Fisher–Yates shuffle on a copy.
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool.slice(0, 40)
  }, [items])

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
    <div className="absolute inset-y-0 right-12 z-10 hidden items-center py-20 lg:right-20 lg:flex xl:right-28">
      <button
        type="button"
        onClick={onOpenArchive}
        aria-label="Open The Archive"
        className="group relative aspect-[3/4] w-[min(34vw,440px)] cursor-pointer outline-none 2xl:w-[520px]"
        style={{ transform: 'skewX(-4deg)' }}
      >
        {/* accent frame */}
        <div className="absolute -inset-3 border border-primary/30 transition-colors duration-300 group-hover:border-primary group-focus-visible:border-primary" />
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
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-5 pt-12 2xl:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id + '-cap'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-1.5"
            >
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
                {current.seller || current.brand || 'SELLER'}
              </span>
              <span className="line-clamp-1 font-display text-2xl italic leading-none text-foreground 2xl:text-3xl">
                {current.title}
              </span>
              {current.price ? (
                <span className="font-mono text-sm text-muted-foreground">{current.price}</span>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
        </div>
      </button>
    </div>
  )
}
