'use client'

import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Minimal live-search input. Keeps its own draft value for responsive typing
 * and pushes a debounced value up to the parent so the grid isn't re-filtered
 * on every keystroke.
 */
export function SearchBar({
  onChange,
  accent = 'primary',
  placeholder = 'Search items...',
  delay = 250,
}: {
  onChange: (value: string) => void
  accent?: 'primary' | 'secondary'
  placeholder?: string
  delay?: number
}) {
  const [draft, setDraft] = useState('')

  useEffect(() => {
    const id = window.setTimeout(() => onChange(draft.trim()), delay)
    return () => window.clearTimeout(id)
  }, [draft, delay, onChange])

  const focusRing =
    accent === 'primary'
      ? 'focus-within:border-primary'
      : 'focus-within:border-secondary'

  return (
    <div className="px-4 py-2 md:px-10">
      <div
        className={`flex items-center gap-2 skew-x-[-8deg] border border-border bg-card px-3 transition-colors ${focusRing}`}
      >
        <Search className="size-4 shrink-0 skew-x-[8deg] text-muted-foreground" aria-hidden />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          aria-label="Search items"
          className="skew-x-[8deg] w-full bg-transparent py-2.5 font-mono text-[13px] tracking-wide text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {draft && (
          <button
            type="button"
            onClick={() => setDraft('')}
            aria-label="Clear search"
            className="flex size-6 shrink-0 skew-x-[8deg] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
