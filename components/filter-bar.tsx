'use client'

import { useRef } from 'react'
import { useT } from '@/lib/prefs'

export function FilterBar({
  options,
  active,
  onChange,
  accent = 'primary',
  label,
  formatOption,
}: {
  options: string[]
  active: string
  onChange: (value: string) => void
  accent?: 'primary' | 'secondary'
  label?: string
  /** Display text for an option (the value itself stays untranslated). */
  formatOption?: (option: string) => string
}) {
  const t = useT()
  const display = formatOption ?? ((o: string) => (o === 'ALL' ? t.common.all : o))
  const scrollRef = useRef<HTMLDivElement>(null)
  // Tracks a mouse click-and-drag session so we can scroll horizontally and
  // suppress the click that would otherwise fire when the drag ends.
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false })

  const activeClass =
    accent === 'primary'
      ? 'bg-primary text-primary-foreground border-primary'
      : 'bg-secondary text-secondary-foreground border-secondary'

  // Only hijack mouse pointers — touch devices keep their native swipe scroll.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const el = scrollRef.current
    if (!el) return
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollRef.current
    if (!el || !drag.current.active) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 4) drag.current.moved = true
    el.scrollLeft = drag.current.startScroll - dx
  }

  const endDrag = () => {
    drag.current.active = false
  }

  // Swallow the click that concludes a drag so a chip isn't accidentally selected.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = false
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 md:px-10">
      {label && (
        <span className="shrink-0 pr-1 font-mono text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
          {label}
        </span>
      )}
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        className="flex flex-1 cursor-grab touch-pan-x select-none gap-2 overflow-x-auto py-1 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {options.map((option) => {
          const isActive = option === active
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`flex min-h-[40px] shrink-0 skew-x-[-8deg] items-center border px-4 py-2 font-mono text-[11px] font-bold tracking-[0.2em] transition-colors ${
                isActive
                  ? activeClass
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              <span className="pointer-events-none inline-block skew-x-[8deg]">{display(option)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
