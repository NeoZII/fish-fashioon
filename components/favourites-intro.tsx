'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import { useEffect } from 'react'

/** First-visit explainer for My Favourites (also reopenable via "How it works"). */
export function FavouritesIntro({
  open,
  onClose,
  onBrowse,
}: {
  open: boolean
  onClose: () => void
  onBrowse: () => void
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const steps = [
    <>
      Tap the <Heart className="inline size-4 -translate-y-px text-destructive" fill="currentColor" aria-label="heart" /> on any
      item in <strong className="text-foreground">LATEST DROPS</strong> or{' '}
      <strong className="text-foreground">ALL ITEMS</strong>.
    </>,
    <>It lands here instantly. No account, no sign-up.</>,
    <>
      Hit <strong className="text-foreground">BUY</strong> when you&apos;re ready, or tap the heart again to remove it.
    </>,
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="fav-intro-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md border border-border bg-card"
          >
            <div className="h-1.5 w-full bg-destructive" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="p-6">
              <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-destructive">HOW IT WORKS</span>
              <h2
                id="fav-intro-title"
                className="mt-2 font-display text-4xl italic leading-none tracking-wide text-foreground"
                style={{ transform: 'skewX(-6deg)' }}
              >
                MY FAVOURITES
              </h2>
              <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
                Save the finds you like and come back to them anytime.
              </p>

              <ol className="mt-5 flex flex-col gap-3">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3 font-mono text-[13px] leading-relaxed text-muted-foreground">
                    <span className="font-display text-2xl italic leading-none text-destructive">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <p className="mt-5 border-t border-border pt-4 font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground">
                Your favourites are saved in this browser on this device. Clearing your browser data removes them.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex min-h-[48px] flex-1 items-center justify-center bg-foreground px-6 font-mono text-xs font-bold tracking-[0.25em] text-background hover:bg-destructive hover:text-destructive-foreground"
                  style={{ transform: 'skewX(-8deg)' }}
                >
                  GOT IT
                </button>
                <button
                  type="button"
                  onClick={onBrowse}
                  className="flex min-h-[48px] flex-1 items-center justify-center border border-border px-6 font-mono text-xs font-bold tracking-[0.25em] text-foreground hover:border-primary hover:text-primary"
                  style={{ transform: 'skewX(-8deg)' }}
                >
                  BROWSE DROPS
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
