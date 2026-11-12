'use client'

import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { normalize } from '@/lib/search'

export type FilterGroup = {
  id: string
  label: string
  options: string[]
  active: string
  onChange: (value: string) => void
  /** Show a search box above the chips (for long lists like brands). */
  searchable?: boolean
}

/**
 * Phones only: a single FILTERS button (with the active filters as removable
 * chips) that opens a slide-up panel with every option. Desktop keeps the
 * horizontal filter rows.
 */
export function MobileFilters({
  groups,
  resultCount,
  accent = 'primary',
}: {
  groups: FilterGroup[]
  resultCount: number
  accent?: 'primary' | 'secondary'
}) {
  const [open, setOpen] = useState(false)
  const activeGroups = groups.filter((g) => g.active !== 'ALL')

  const accentBg = accent === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
  const accentBorder = accent === 'primary' ? 'border-primary' : 'border-secondary'

  // Lock page scroll + Escape to close while the panel is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) setOpen(false)
  }

  const clearAll = () => groups.forEach((g) => g.onChange('ALL'))

  return (
    <div className="md:hidden">
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className={`flex min-h-[40px] shrink-0 items-center gap-2 border px-4 font-mono text-[11px] font-bold tracking-[0.2em] ${
            activeGroups.length ? `${accentBg} ${accentBorder}` : 'border-border text-foreground'
          }`}
          style={{ transform: 'skewX(-8deg)' }}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          FILTERS{activeGroups.length ? ` · ${activeGroups.length}` : ''}
        </button>
        {activeGroups.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => g.onChange('ALL')}
            aria-label={`Remove ${g.label.toLowerCase()} filter ${g.active}`}
            className={`flex min-h-[40px] shrink-0 items-center gap-1.5 border px-3 font-mono text-[11px] font-bold tracking-[0.15em] text-foreground ${accentBorder}`}
            style={{ transform: 'skewX(-8deg)' }}
          >
            {g.active}
            <X className="size-3.5" aria-hidden />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={onDragEnd}
              className="fixed inset-x-0 bottom-0 z-[81] flex max-h-[88dvh] flex-col border-t border-border bg-card"
            >
              {/* grab handle + header */}
              <div className="flex shrink-0 cursor-grab flex-col items-center pt-2 active:cursor-grabbing">
                <span className="h-1.5 w-12 rounded-full bg-muted-foreground/40" aria-hidden />
              </div>
              <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-2">
                <h2 className="font-display text-3xl italic tracking-wide text-foreground" style={{ transform: 'skewX(-6deg)' }}>
                  FILTERS
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close filters"
                  className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* options (own scroll; doesn't drag the sheet) */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4"
                onPointerDownCapture={(e) => e.stopPropagation()}
              >
                {groups.map((g) => (
                  <FilterSection key={g.id} group={g} accentBg={accentBg} accentBorder={accentBorder} />
                ))}
              </div>

              {/* footer */}
              <div className="flex shrink-0 items-center gap-3 border-t border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={!activeGroups.length}
                  className="min-h-[48px] px-4 font-mono text-xs font-bold tracking-[0.2em] text-muted-foreground disabled:opacity-40"
                >
                  CLEAR ALL
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={`flex min-h-[48px] flex-1 items-center justify-center font-mono text-xs font-bold tracking-[0.25em] ${accentBg}`}
                  style={{ transform: 'skewX(-8deg)' }}
                >
                  SHOW {resultCount.toLocaleString('en-US')} {resultCount === 1 ? 'ITEM' : 'ITEMS'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterSection({
  group,
  accentBg,
  accentBorder,
}: {
  group: FilterGroup
  accentBg: string
  accentBorder: string
}) {
  const [query, setQuery] = useState('')
  const options = useMemo(() => {
    const q = normalize(query)
    if (!q) return group.options
    return group.options.filter((o) => o === 'ALL' || normalize(o).includes(q))
  }, [group.options, query])

  return (
    <section className="border-t border-border py-4 first:border-t-0">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-mono text-[11px] font-bold tracking-[0.3em] text-muted-foreground">{group.label}</h3>
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
          {(group.options.length - 1).toLocaleString('en-US')}
        </span>
      </div>

      {group.searchable && (
        <label className="mb-3 flex items-center gap-2 border border-border bg-background px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Find a ${group.label.toLowerCase()}…`}
            aria-label={`Find a ${group.label.toLowerCase()}`}
            className="w-full bg-transparent py-2.5 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear" className="text-muted-foreground">
              <X className="size-4" />
            </button>
          )}
        </label>
      )}

      <div className={`flex flex-wrap gap-2 ${group.searchable ? 'max-h-[34dvh] overflow-y-auto overscroll-contain pr-1' : ''}`}>
        {options.map((option) => {
          const isActive = option === group.active
          return (
            <button
              key={option}
              type="button"
              onClick={() => group.onChange(option)}
              aria-pressed={isActive}
              className={`flex min-h-[40px] items-center border px-3.5 font-mono text-[11px] font-bold tracking-[0.15em] transition-colors ${
                isActive ? `${accentBg} ${accentBorder}` : 'border-border text-muted-foreground'
              }`}
              style={{ transform: 'skewX(-8deg)' }}
            >
              {option}
            </button>
          )
        })}
        {options.length <= 1 && query && (
          <p className="py-2 font-mono text-xs text-muted-foreground">No {group.label.toLowerCase()} matches “{query}”.</p>
        )}
      </div>
    </section>
  )
}
