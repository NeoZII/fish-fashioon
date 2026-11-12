'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Flag, Shuffle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Product } from '@/lib/data'
import { ProductImage } from '@/components/product-image'
import { parsePrice } from '@/lib/price'
import Link from 'next/link'
import { itemPath } from '@/lib/item-key'
import { FavouriteButton } from '@/components/favourite-button'

const BATCH_SIZE = 16

const REPORT_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbx9v3aqzotQmh3zlbD6oVh0xdwcoiDt6Z5qzzM7L1ZLABQSNUhAbWZgJooCnRG8hN5w/exec'

type ReportReason = 'Dead link' | 'Out of stock'

const SHUFFLE_SEED_KEY = 'catalog-shuffle-seed'

/** True only if this page load was a voluntary browser refresh/reload. */
function isPageReload(): boolean {
  if (typeof window === 'undefined' || !window.performance) return false
  try {
    const [nav] = window.performance.getEntriesByType(
      'navigation',
    ) as PerformanceNavigationTiming[]
    return nav?.type === 'reload'
  } catch {
    return false
  }
}

// Regenerate the seed at most once per page load, so multiple grid mounts in
// the same load share one order instead of each making its own.
let reloadSeedApplied = false

/**
 * Get (or lazily create) a random seed for the catalog order.
 *
 * The seed lives in sessionStorage, so it survives in-session client-side
 * navigation — going into a product and back keeps the same order. A voluntary
 * browser refresh generates a NEW seed (detected via the Navigation Timing
 * API), and a new tab / restarted browser starts fresh as well.
 */
function getSessionSeed(): number {
  if (typeof window === 'undefined') return 1
  try {
    // On a voluntary refresh, mint a new seed once for this page load.
    if (!reloadSeedApplied && isPageReload()) {
      reloadSeedApplied = true
      const seed = Math.floor(Math.random() * 0x7fffffff)
      window.sessionStorage.setItem(SHUFFLE_SEED_KEY, String(seed))
      return seed
    }
    reloadSeedApplied = true

    const existing = window.sessionStorage.getItem(SHUFFLE_SEED_KEY)
    if (existing) return Number(existing)
    const seed = Math.floor(Math.random() * 0x7fffffff)
    window.sessionStorage.setItem(SHUFFLE_SEED_KEY, String(seed))
    return seed
  } catch {
    // sessionStorage unavailable (e.g. privacy mode) — fall back to a random
    // per-mount seed so the grid still renders in a shuffled order.
    return Math.floor(Math.random() * 0x7fffffff)
  }
}

/**
 * Deterministic hash of (seed + product id) mapped to [0, 1). The same seed
 * and id always yield the same rank, which is what makes the order stable
 * within a session.
 */
function seededRank(seed: number, id: string): number {
  let h = seed >>> 0
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 0x01000193) >>> 0
  }
  h ^= h >>> 15
  h = Math.imul(h, 0x2c1b3c6d) >>> 0
  h ^= h >>> 13
  return (h >>> 0) / 0xffffffff
}

/**
 * Shuffle deterministically. Without an override, uses the stable session seed
 * so the order survives in-session navigation. Passing an `overrideSeed`
 * (from the SHUFFLE button) reorders instantly without touching the session
 * seed, so the base order is unaffected.
 */
function shuffle<T extends { id: string }>(input: T[], overrideSeed?: number): T[] {
  const seed = overrideSeed ?? getSessionSeed()
  return [...input].sort((a, b) => seededRank(seed, a.id) - seededRank(seed, b.id))
}

export function ProductGrid({
  items,
  accent = 'primary',
  shuffleItems = true,
  showShuffle = false,
  emptyMessage = 'NOTHING IN THIS DRAWER YET',
}: {
  items: Product[]
  accent?: 'primary' | 'secondary'
  /** When false, keep the incoming order (e.g. LATEST DROPS is date-sorted). */
  shuffleItems?: boolean
  /** Show the manual SHUFFLE button (Archive tab). */
  showShuffle?: boolean
  /** Message shown when there are no items to display. */
  emptyMessage?: string
}) {
  const [ordered, setOrdered] = useState<Product[]>([])
  const [visible, setVisible] = useState(BATCH_SIZE)
  const [reportTarget, setReportTarget] = useState<Product | null>(null)
  const [showToast, setShowToast] = useState(false)
  // A manual override seed set by the SHUFFLE button, and a key that bumps on
  // each shuffle so the grid replays its staggered entrance animation.
  const [manualSeed, setManualSeed] = useState<number | null>(null)
  const [shuffleKey, setShuffleKey] = useState(0)
  const [spinning, setSpinning] = useState(false)

  const handleReported = () => {
    setReportTarget(null)
    setShowToast(true)
    window.setTimeout(() => setShowToast(false), 2000)
  }

  const handleShuffle = () => {
    const seed = Math.floor(Math.random() * 0x7fffffff)
    setManualSeed(seed)
    setOrdered(shuffle(items, seed))
    setVisible(BATCH_SIZE)
    setShuffleKey((k) => k + 1)
    setSpinning(true)
    window.setTimeout(() => setSpinning(false), 600)
  }

  // Re-order + reset pagination whenever the source list changes
  // (new fetch, category filter, seller switch, or a fresh page load).
  // A manual shuffle seed, if present, is preserved across filter changes.
  useEffect(() => {
    setOrdered(shuffleItems ? shuffle(items, manualSeed ?? undefined) : items)
    setVisible(BATCH_SIZE)
  }, [items, shuffleItems, manualSeed])

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-border py-24 text-center font-mono text-sm tracking-[0.25em] text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  const shown = ordered.slice(0, visible)
  const hasMore = visible < ordered.length

  return (
    <div>
      {showShuffle && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={handleShuffle}
            aria-label="Shuffle products"
            className="group relative flex items-center gap-2.5 skew-x-[-8deg] overflow-hidden bg-secondary px-6 py-3 font-mono text-xs font-bold tracking-[0.3em] text-secondary-foreground transition-all duration-300 hover:shadow-[0_0_28px_-4px_var(--color-secondary)] active:scale-95"
          >
            {/* sheen swipe on hover */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <motion.span
              animate={spinning ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex skew-x-[8deg]"
            >
              <Shuffle className="size-4" />
            </motion.span>
            <span className="skew-x-[8deg]">SHUFFLE</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {shown.map((item, i) => (
          <ProductCard
            key={`${shuffleKey}-${item.id}`}
            product={item}
            index={i % BATCH_SIZE}
            accent={accent}
            onReport={() => setReportTarget(item)}
          />
        ))}
      </div>

      <ReportModal
        product={reportTarget}
        onClose={() => setReportTarget(null)}
        onReported={handleReported}
      />

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 skew-x-[-6deg] bg-foreground px-5 py-3 font-mono text-xs font-bold tracking-[0.2em] text-background shadow-lg">
              <Check className="size-4 shrink-0" />
              THANKS, REPORTED!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasMore && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
            {String(Math.min(visible, ordered.length)).padStart(2, '0')} / {String(ordered.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={() => setVisible((v) => v + BATCH_SIZE)}
            className={`skew-x-[-8deg] px-8 py-3 font-mono text-xs font-bold tracking-[0.3em] transition-colors ${
              accent === 'primary'
                ? 'bg-primary text-primary-foreground hover:bg-foreground hover:text-background'
                : 'bg-secondary text-secondary-foreground hover:bg-foreground hover:text-background'
            }`}
          >
            LOAD MORE
          </button>
        </div>
      )}
    </div>
  )
}

function ProductCard({
  product,
  index,
  accent,
  onReport,
}: {
  product: Product
  index: number
  accent: 'primary' | 'secondary'
  onReport: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: -py * 8, ry: px * 8 })
  }

  const tagClass = accent === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
  const priceClass = accent === 'primary' ? 'text-primary' : 'text-secondary'
  const price = parsePrice(product.price)

  return (
    <motion.div
      initial={{ opacity: 0, y: 34 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index, 12) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="group flex h-full flex-col overflow-hidden rounded-md border border-border bg-card"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <Link
            href={itemPath(product)}
            prefetch={false}
            aria-label={`View ${product.title}`}
            className="absolute inset-0 z-0"
          />
          <ProductImage
            src={product.image}
            alt={product.title}
            // First row loads immediately; the rest only as they scroll into view.
            loading={index < 4 ? 'eager' : 'lazy'}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent" />
          <span
            className={`pointer-events-none absolute left-2 top-2 skew-x-[-8deg] px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.2em] ${tagClass}`}
          >
            {product.category}
          </span>
          <FavouriteButton itemKey={product.key} title={product.title} className="absolute right-2 top-2 z-10" />
          <button
            type="button"
            onClick={onReport}
            aria-label={`Report ${product.title}`}
            title="Report this item"
            className="absolute right-3 top-12 z-10 flex size-7 items-center justify-center rounded-full bg-black/55 text-white/70 transition-colors hover:bg-black/75 hover:text-white"
          >
            <Flag className="size-3.5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3" style={{ transform: 'translateZ(24px)' }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {product.brand}
          </span>
          <h3 className="font-display text-base italic leading-tight tracking-wide text-foreground text-balance">
            <Link href={itemPath(product)} prefetch={false} className="hover:text-primary">
              {product.title}
            </Link>
          </h3>
          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <div className="flex min-w-0 flex-1 flex-col leading-none">
              <span className={`truncate font-mono text-sm font-semibold tabular-nums sm:text-base ${priceClass}`}>
                {price.usd}
              </span>
              {price.cny && (
                <span className="mt-1 truncate font-mono text-[11px] tabular-nums text-muted-foreground">
                  {price.cny}
                </span>
              )}
            </div>
            <a
              href={product.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[40px] shrink-0 skew-x-[-8deg] items-center gap-1 bg-foreground px-4 py-2 font-mono text-[11px] font-bold tracking-[0.2em] text-background transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label={`Buy ${product.title}`}
            >
              BUY
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ReportModal({
  product,
  onClose,
  onReported,
}: {
  product: Product | null
  onClose: () => void
  onReported: () => void
}) {
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Reset selection each time a new product is opened.
  useEffect(() => {
    if (product) {
      setReason(null)
      setSubmitting(false)
    }
  }, [product])

  const handleSubmit = async () => {
    if (!product || !reason || submitting) return
    setSubmitting(true)
    try {
      await fetch(REPORT_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.title,
          reason,
          productUrl: product.link || '',
        }),
      })
    } catch (err) {
      console.log('[v0] report submit error:', err)
    }
    onReported()
  }

  const reasons: ReportReason[] = ['Dead link', 'Out of stock']

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Report product"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-md border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
                  REPORT ITEM
                </span>
                <h3 className="mt-1 font-display text-lg italic leading-tight tracking-wide text-foreground text-balance">
                  {product.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {reasons.map((r) => {
                const active = reason === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    aria-pressed={active}
                    className={`skew-x-[-6deg] px-3 py-3 font-mono text-[11px] font-bold tracking-[0.15em] transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-transparent text-foreground hover:border-primary'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="mt-5 w-full skew-x-[-6deg] bg-foreground px-4 py-3 font-mono text-xs font-bold tracking-[0.3em] text-background transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? 'SENDING…' : 'SUBMIT'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
