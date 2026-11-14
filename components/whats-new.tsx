'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarDays,
  Flame,
  Globe,
  Heart,
  Link2,
  Play,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ViewId } from '@/lib/data'
import type { WhatsNewCard } from '@/lib/i18n'
import { useT } from '@/lib/prefs'
import { CARD_HREF, CARD_TARGET, CARDS_NEW, CARDS_RETURNING } from '@/lib/whats-new'

const ICONS: Record<WhatsNewCard, LucideIcon> = {
  find: Search,
  favs: Heart,
  shareFavs: Share2,
  buy: ShoppingBag,
  video: Play,
  codes: Ticket,
  prefs: Globe,
  search: Search,
  items: Link2,
  links: ShieldCheck,
  trending: Flame,
  weekly: CalendarDays,
}

/** Cards in pink (favourites features); the rest use the site's cyan. */
const PINK: ReadonlySet<WhatsNewCard> = new Set(['favs', 'shareFavs'])

export type GuideTab = 'new' | 'back'

/**
 * The "What's new" / "How it works" guide: a bottom sheet on phones, a centred
 * panel on desktop. Two tabs so everyone can read both lists; it opens on the
 * one that fits the visitor (first visit → how it works, returning → what's new).
 */
export function WhatsNew({
  open,
  initialTab,
  onClose,
  onOpen,
}: {
  open: boolean
  initialTab: GuideTab
  onClose: () => void
  /** Go to a section (closes the guide first). */
  onOpen: (view: Exclude<ViewId, 'menu'>) => void
}) {
  const t = useT()
  const [tab, setTab] = useState<GuideTab>(initialTab)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) setTab(initialTab)
  }, [open, initialTab])

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 })
  }, [tab])

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

  const cards = tab === 'back' ? CARDS_RETURNING : CARDS_NEW
  const kicker = tab === 'back' ? t.whatsNew.kickerBack : t.whatsNew.kickerNew
  const title = tab === 'back' ? t.whatsNew.titleBack : t.whatsNew.titleNew
  const lead = tab === 'back' ? t.whatsNew.leadBack : t.whatsNew.leadNew

  const tabs: { id: GuideTab; label: string }[] = [
    { id: 'back', label: t.whatsNew.titleBack },
    { id: 'new', label: t.whatsNew.titleNew },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[95] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="whats-new-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 48 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[88dvh] w-full max-w-lg flex-col border border-border bg-card sm:max-h-[84dvh]"
          >
            <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-primary via-secondary to-fav" />

            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.close}
              className="absolute right-3 top-4 z-10 flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="shrink-0 px-5 pb-4 pt-6 sm:px-7">
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.3em] text-primary">
                <Sparkles className="size-4" aria-hidden />
                {kicker}
              </p>
              <h2
                id="whats-new-title"
                className="mt-2 pr-10 font-display text-4xl italic leading-[0.95] tracking-wide text-foreground sm:text-5xl"
              >
                {title}
              </h2>
              <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">{lead}</p>

              <div role="tablist" className="mt-4 flex gap-2">
                {tabs.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === x.id}
                    onClick={() => setTab(x.id)}
                    className={`min-h-[36px] border px-3 font-mono text-[10px] font-bold tracking-[0.2em] transition-colors ${
                      tab === x.id
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                    }`}
                    style={{ transform: 'skewX(-8deg)' }}
                  >
                    {x.label}
                  </button>
                ))}
              </div>
            </div>

            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border">
              <ol className="flex flex-col">
                {cards.map((id, i) => {
                  const Icon = ICONS[id]
                  const target = CARD_TARGET[id]
                  const href = CARD_HREF[id]
                  const pink = PINK.has(id)
                  const card = t.whatsNew.cards[id]
                  return (
                    <li key={id} className="flex gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:px-7">
                      <span
                        className={`mt-0.5 flex size-10 shrink-0 items-center justify-center ${
                          pink ? 'bg-fav/15 text-fav' : 'bg-primary/15 text-primary'
                        }`}
                        style={{ transform: 'skewX(-8deg)' }}
                        aria-hidden
                      >
                        <Icon className="size-5" fill={id === 'favs' || id === 'trending' ? 'currentColor' : 'none'} strokeWidth={id === 'trending' ? 0 : 2} />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <h3 className="font-mono text-xs font-bold tracking-[0.18em] text-foreground">
                          <span className="mr-2 text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                          {card.title}
                        </h3>
                        <p className="font-mono text-xs leading-relaxed text-muted-foreground">{card.body}</p>
                        {href && (
                          <a
                            href={href}
                            onClick={onClose}
                            className={`mt-1 flex items-center gap-1.5 self-start font-mono text-[11px] font-bold tracking-[0.2em] ${
                              pink ? 'text-fav' : 'text-primary'
                            } hover:underline`}
                          >
                            {t.whatsNew.open}
                            <ArrowRight className="size-3.5" aria-hidden />
                          </a>
                        )}
                        {target && (
                          <button
                            type="button"
                            onClick={() => onOpen(target)}
                            className={`mt-1 flex items-center gap-1.5 self-start font-mono text-[11px] font-bold tracking-[0.2em] ${
                              pink ? 'text-fav' : 'text-primary'
                            } hover:underline`}
                          >
                            {t.whatsNew.open}
                            <ArrowRight className="size-3.5" aria-hidden />
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>

            <div className="shrink-0 border-t border-border p-4 sm:px-7">
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-[48px] w-full items-center justify-center bg-foreground px-6 font-mono text-xs font-bold tracking-[0.25em] text-background hover:bg-primary hover:text-primary-foreground"
                style={{ transform: 'skewX(-8deg)' }}
              >
                {t.whatsNew.gotIt}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
