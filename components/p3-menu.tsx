'use client'

import { motion } from 'framer-motion'
import { type CSSProperties, useCallback, useEffect, useState } from 'react'
import { MENU_ITEMS, type MenuItem, type Product } from '@/lib/data'
import { ProductSlideshow } from '@/components/product-slideshow'

export function P3Menu({
  onNavigate,
  items = [],
}: {
  onNavigate: (id: MenuItem['id']) => void
  items?: Product[]
}) {
  const [active, setActive] = useState(0)

  const move = useCallback((dir: number) => {
    setActive((prev) => Math.min(MENU_ITEMS.length - 1, Math.max(0, prev + dir)))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        move(-1)
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        move(1)
      }
      if (e.key === 'Enter') onNavigate(MENU_ITEMS[active].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, move, onNavigate])

  return (
    <div className="relative flex min-h-dvh w-full items-center overflow-hidden">
      {/* moving diagonal stripes */}
      <div className="p3-stripes pointer-events-none absolute inset-0 opacity-70" />
      {/* floating geometric shapes */}
      <FloatingShapes />

      {/* right vertical accent bar */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex">
        <div className="w-[6px] bg-primary" />
        <div className="ml-2 w-[2px] bg-secondary/40" />
      </div>

      {/* big tilted name tag */}
      <motion.div
        initial={{ opacity: 0, x: -40, rotate: 14 }}
        animate={{ opacity: 1, x: 0, rotate: 16 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-4 top-6 z-0 flex origin-top-left flex-col font-display italic leading-[0.82] text-foreground/5 md:left-8"
      >
        <span className="text-[16vw] md:text-[9vw]">FashionSea</span>
      </motion.div>

      {/* desktop-only auto-rotating product slideshow */}
      <ProductSlideshow items={items} onOpenArchive={() => onNavigate('archive')} />

      {/* featured countdown release — responsive top-center CTA */}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center px-4 sm:top-5 md:top-6">
        <motion.button
          type="button"
          onClick={() => onNavigate('countdown')}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto relative flex min-h-12 w-full max-w-[min(92vw,34rem)] items-center justify-center gap-2.5 bg-destructive px-4 py-3 text-center font-mono text-[10px] font-bold tracking-[0.18em] text-destructive-foreground shadow-[0_0_30px_-8px_var(--color-destructive)] transition-all duration-300 hover:scale-[1.02] hover:bg-foreground hover:text-background hover:shadow-[0_0_38px_-6px_var(--color-destructive)] sm:px-6 sm:text-xs md:min-h-14 md:max-w-[38rem] md:text-sm md:tracking-[0.25em]"
          style={{ clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0 100%)' }}
        >
          <span className="size-2 shrink-0 animate-pulse rounded-full bg-current" aria-hidden />
          <span>BURBERRY PUFFER COUNTDOWN</span>
        </motion.button>
      </div>

      {/* menu list */}
      <nav
        className="relative z-20 flex w-full max-w-[calc(100vw-2rem)] flex-col gap-1.5 px-4 pt-16 sm:gap-2 sm:pl-8 md:w-auto md:max-w-none md:gap-3 md:pl-24 md:pt-0"
        aria-label="Main menu"
      >
        {MENU_ITEMS.map((item, i) => {
          const isActive = i === active
          return (
            <motion.button
              key={item.id}
              type="button"
              custom={i}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: isActive ? 1 : 0.45, x: 0 }}
              transition={{
                opacity: { duration: 0.35 },
                x: { duration: 0.5, delay: 0.4 + i * 0.09, ease: [0.22, 1, 0.36, 1] },
              }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => onNavigate(item.id)}
              style={{ marginLeft: item.offsetX }}
              className="group relative flex items-center gap-4 text-left outline-none"
              aria-current={isActive ? 'true' : undefined}
            >
              {/* active glow */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute -inset-x-8 -inset-y-4 -z-10 rounded-full bg-primary/25 blur-2xl"
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              <span
                className="relative block"
                style={{ transform: `skewX(${item.skewX}deg) skewY(${item.skewY}deg)` }}
              >
                {/* white highlight slab behind active label */}
                <motion.span
                  aria-hidden
                  className="absolute inset-y-1 -left-3 -right-6 -z-10 bg-foreground"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 94% 100%, 4% 100%)', originX: 0 }}
                  initial={false}
                  animate={{ scaleX: isActive ? 1 : 0 }}
                  transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
                />

                {/* pulsing glow for the highlighted item (CSS-driven) */}
                {item.glowRed && !isActive && (
                  <span
                    aria-hidden
                    className="p3-menu-glow pointer-events-none absolute -inset-x-4 -inset-y-2 -z-10 rounded-full bg-primary/40 blur-2xl"
                  />
                )}

                <span
                  className={`block font-display italic leading-[0.85] tracking-wide transition-colors duration-150 ${
                    isActive
                      ? 'text-background'
                      : item.glowRed
                        ? 'text-primary'
                        : item.redAccent
                          ? 'text-primary/75'
                          : 'text-foreground/80'
                  }`}
                  style={{
                    // Scales down on phones (vw-driven), capped at the original
                    // desktop size (fontSize/16rem) so PC sizing is unchanged.
                    fontSize: `clamp(1.35rem, ${(item.fontSize / 11).toFixed(1)}vw, ${item.fontSize / 20}rem)`,
                    ...(item.glowRed && !isActive
                      ? { textShadow: '0 0 18px color-mix(in oklch, var(--primary) 80%, transparent)' }
                      : {}),
                  }}
                >
                  {item.label}
                </span>
              </span>

            </motion.button>
          )
        })}
      </nav>

      {/* hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-6 right-8 z-20 flex flex-col items-end gap-1.5 font-mono text-[11px] tracking-[0.2em] text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <kbd className="rounded-sm border border-border px-1.5 py-0.5">↑↓</kbd>
          <span>NAVIGATE</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="rounded-sm border border-border px-1.5 py-0.5">↵</kbd>
          <span>CONFIRM</span>
        </div>
      </motion.div>
    </div>
  )
}

function FloatingShapes() {
  const shapes = [
    { size: 120, top: '14%', left: '58%', color: 'var(--primary)', dur: 9, clip: 'polygon(50% 0, 100% 100%, 0 100%)' },
    { size: 70, top: '70%', left: '46%', color: 'var(--secondary)', dur: 12, clip: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
    { size: 46, top: '28%', left: '84%', color: 'var(--foreground)', dur: 7, clip: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' },
    { size: 90, top: '52%', left: '72%', color: 'var(--primary)', dur: 14, clip: 'polygon(50% 0, 100% 100%, 0 100%)' },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {shapes.map((s, i) => (
        <div
          key={i}
          className="p3-float absolute opacity-[0.14]"
          style={
            {
              width: s.size,
              height: s.size,
              top: s.top,
              left: s.left,
              background: s.color,
              clipPath: s.clip,
              '--float-dur': `${s.dur}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
