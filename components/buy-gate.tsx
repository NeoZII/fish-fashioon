'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Play, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { BUY_GATE_EVENT, onSignupClick, rememberKakobuyAnswer, SIGNUP_URL, type GateItem } from '@/lib/buy-gate'
import { useT } from '@/lib/prefs'

/**
 * The "First time on Kakobuy?" sheet (see lib/buy-gate.ts). Mounted once in
 * the root layout; any BUY link opens it through a window event. All choices
 * are real links (target=_blank), which in-app browsers like TikTok's handle
 * better than window.open.
 */
export function BuyGate() {
  const t = useT()
  const [item, setItem] = useState<GateItem | null>(null)
  const [step, setStep] = useState<'ask' | 'signed-up'>('ask')

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<GateItem>).detail
      if (!detail?.link) return
      setItem(detail)
      setStep('ask')
    }
    window.addEventListener(BUY_GATE_EVENT, onOpen)
    return () => window.removeEventListener(BUY_GATE_EVENT, onOpen)
  }, [])

  const close = useCallback(() => setItem(null), [])

  useEffect(() => {
    if (!item) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [item, close])

  const primary =
    'flex min-h-[52px] w-full items-center justify-between gap-3 bg-primary px-5 text-left text-primary-foreground transition-[filter] hover:brightness-110'
  const secondary =
    'flex min-h-[48px] w-full items-center justify-between gap-3 border border-border px-5 text-left text-foreground transition-colors hover:border-foreground'

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-gate-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md border border-border bg-card pb-[env(safe-area-inset-bottom)]"
          >
            <div className="h-1.5 w-full bg-primary" />
            <button
              type="button"
              onClick={close}
              aria-label={t.common.close}
              className="absolute right-3 top-4 flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            {step === 'ask' ? (
              <div className="px-5 pb-5 pt-6 sm:px-7">
                <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.3em] text-primary">
                  <Sparkles className="size-4" aria-hidden />
                  {t.gate.kicker}
                </p>
                <h2 id="buy-gate-title" className="mt-2 pr-10 font-display text-4xl italic leading-[0.95] tracking-wide text-foreground">
                  {t.gate.title}
                </h2>
                <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">{t.gate.body}</p>

                <div className="mt-5 flex flex-col gap-3">
                  <a
                    href={SIGNUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      onSignupClick('gate')
                      setStep('signed-up')
                    }}
                    className={primary}
                  >
                    <span className="flex flex-col gap-0.5">
                      <span className="font-mono text-sm font-bold tracking-[0.15em]">{t.gate.newHere}</span>
                      <span className="font-mono text-[11px] tracking-[0.05em] opacity-90">{t.gate.newHereSub}</span>
                    </span>
                    <ArrowUpRight className="size-5 shrink-0" aria-hidden />
                  </a>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      rememberKakobuyAnswer('has-account')
                      close()
                    }}
                    className={secondary}
                  >
                    <span className="font-mono text-xs font-bold tracking-[0.15em]">{t.gate.haveAccount}</span>
                    <ArrowUpRight className="size-4 shrink-0" aria-hidden />
                  </a>
                </div>

                <Link
                  href="/how-to-buy"
                  onClick={close}
                  className="mt-4 flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-muted-foreground hover:text-primary"
                >
                  <Play className="size-3.5" aria-hidden />
                  {t.gate.howItWorks}
                </Link>
              </div>
            ) : (
              <div className="px-5 pb-5 pt-6 sm:px-7">
                <p className="font-mono text-[11px] font-bold tracking-[0.3em] text-primary">{t.gate.kickerDone}</p>
                <h2 id="buy-gate-title" className="mt-2 pr-10 font-display text-4xl italic leading-[0.95] tracking-wide text-foreground">
                  {t.gate.titleDone}
                </h2>
                <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">{t.gate.bodyDone}</p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className={`${primary} mt-5`}
                >
                  <span className="font-mono text-sm font-bold tracking-[0.15em]">{t.gate.openItem}</span>
                  <ArrowUpRight className="size-5 shrink-0" aria-hidden />
                </a>
                <p className="mt-3 line-clamp-2 font-mono text-[11px] text-muted-foreground">{item.title}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
