'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Globe } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LANG_NAMES, LANGS } from '@/lib/i18n'
import type { Currency } from '@/lib/money'
import { setCurrency, setLang, usePrefs, useT } from '@/lib/prefs'

const CURRENCIES: { id: Currency; symbol: string }[] = [
  { id: 'USD', symbol: '$' },
  { id: 'EUR', symbol: '€' },
]

/**
 * Compact "EN · $" button opening a small panel to pick the interface language
 * and the price currency. Choices are remembered in this browser.
 */
export function PrefsSwitch({
  align = 'right',
  direction = 'down',
  className = '',
}: {
  /** Which edge of the button the panel lines up with. */
  align?: 'left' | 'right'
  /** Open below (headers) or above (bottom of the menu screen). */
  direction?: 'down' | 'up'
  className?: string
}) {
  const { lang, currency, rates, ratesLive } = usePrefs()
  const t = useT()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const symbol = currency === 'EUR' ? '€' : '$'
  const offset = direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
  const side = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${t.prefs.aria}: ${LANG_NAMES[lang].name}, ${currency}`}
        className={`flex min-h-[44px] items-center gap-1.5 border bg-background/60 px-3 font-mono text-[11px] font-bold tracking-[0.2em] transition-colors ${
          open ? 'border-primary text-primary' : 'border-border text-foreground hover:border-primary hover:text-primary'
        }`}
        style={{ transform: 'skewX(-8deg)' }}
      >
        <Globe className="size-4" aria-hidden />
        <span>
          {LANG_NAMES[lang].short}
          <span className="px-1 text-muted-foreground">·</span>
          {symbol}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={t.prefs.aria}
            initial={{ opacity: 0, y: direction === 'up' ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction === 'up' ? 6 : -6 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-56 border border-border bg-card p-3 shadow-2xl ${offset} ${side}`}
          >
            <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.3em] text-muted-foreground">
              {t.prefs.language}
            </p>
            <ul className="flex flex-col">
              {LANGS.map((l) => {
                const active = l === lang
                return (
                  <li key={l}>
                    <button
                      type="button"
                      lang={l}
                      onClick={() => setLang(l)}
                      aria-pressed={active}
                      className={`flex w-full items-center justify-between gap-2 px-2.5 py-2.5 text-left font-mono text-xs transition-colors ${
                        active ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-6 font-bold tracking-[0.15em]">{LANG_NAMES[l].short}</span>
                        <span>{LANG_NAMES[l].name}</span>
                      </span>
                      {active && <Check className="size-4" aria-hidden />}
                    </button>
                  </li>
                )
              })}
            </ul>

            <p className="mb-2 mt-4 font-mono text-[10px] font-bold tracking-[0.3em] text-muted-foreground">
              {t.prefs.currency}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CURRENCIES.map((c) => {
                const active = c.id === currency
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCurrency(c.id)}
                    aria-pressed={active}
                    className={`flex min-h-[40px] items-center justify-center gap-1.5 border font-mono text-xs font-bold tracking-[0.15em] transition-colors ${
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:border-primary hover:text-primary'
                    }`}
                    style={{ transform: 'skewX(-8deg)' }}
                  >
                    <span className="text-sm">{c.symbol}</span>
                    {c.id}
                  </button>
                )
              })}
            </div>
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
              {t.prefs.rate(rates.EUR.toFixed(3).replace('.', lang === 'en' ? '.' : ','), ratesLive)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
