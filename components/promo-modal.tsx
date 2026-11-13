'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/prefs'

const STORAGE_KEY = 'fishfashion:promo-seen'
const OFFER_URL = 'https://ikako.vip/r/dqh2u'
const COUPON_CODE = 'Fashionsea'

/**
 * One-time promotional modal. Appears ~1.2s after first load, then records a
 * timestamp so it won't reappear for the same visitor within 24h. Uses
 * localStorage so it survives navigation and page reloads.
 */
export function PromoModal() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const t = useT()

  useEffect(() => {
    let show = true
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY)
      if (seen) {
        const last = Number(seen)
        // Re-show only after 24h have passed.
        if (!Number.isNaN(last) && Date.now() - last < 24 * 60 * 60 * 1000) {
          show = false
        }
      }
    } catch {
      // If storage is unavailable, still show once this load.
    }

    if (!show) return
    const timer = window.setTimeout(() => setOpen(true), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  // Lock body scroll while open + allow Escape to close.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function close() {
    setOpen(false)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      // Best-effort — nothing to do if storage is blocked.
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(COUPON_CODE).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      },
      () => {},
    )
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t.promo.dialogAria}
    >
      {/* Overlay — click outside to close */}
      <button
        type="button"
        aria-label={t.promo.closeOffer}
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          type="button"
          onClick={close}
          aria-label={t.common.close}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg leading-none text-foreground/80 transition hover:bg-black/70 hover:text-foreground"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        {/* Flashy header banner */}
        <div className="promo-glow relative flex flex-col items-center gap-3 bg-primary px-6 py-8 text-center text-primary-foreground">
          <p className="font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl text-balance">
            {t.promo.headline}
          </p>
          <button
            type="button"
            onClick={copyCode}
            className="promo-pulse inline-flex items-center gap-2 rounded-full border-2 border-dashed border-primary-foreground/80 bg-primary-foreground/10 px-5 py-2 font-mono text-sm font-semibold uppercase tracking-widest transition hover:bg-primary-foreground/20"
            aria-label={t.promo.copyAria(COUPON_CODE)}
          >
            <span>{COUPON_CODE}</span>
            <span className="text-xs opacity-80">{copied ? t.promo.copied : t.promo.tapToCopy}</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center gap-5 px-6 py-7 text-center">
          <p className="text-pretty text-base leading-relaxed text-foreground">
            {t.promo.bodyBefore}
            <span className="font-semibold text-primary">{t.promo.highlight}</span>
            {t.promo.bodyAfter}
          </p>

          <a
            href={OFFER_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="group flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-4 font-display text-lg uppercase tracking-wide text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
          >
            {t.promo.claim}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </a>

          <button
            type="button"
            onClick={close}
            className="text-xs uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
          >
            {t.promo.noThanks}
          </button>
        </div>
      </div>
    </div>
  )
}
