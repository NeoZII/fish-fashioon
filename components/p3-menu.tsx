'use client'

import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
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
      <ProductSlideshow items={items} />

      {/* menu list */}
      <nav
        className="relative z-20 flex flex-col gap-2 pl-6 md:gap-3 md:pl-24"
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

                {/* pulsing red glow for the highlighted "HOW TO BUY" item */}
                {item.glowRed && !isActive && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute -inset-x-4 -inset-y-2 -z-10 rounded-full bg-primary/40 blur-2xl"
                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.96, 1.04, 0.96] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
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
                    fontSize: `clamp(1.75rem, ${(item.fontSize / 8).toFixed(1)}vw, ${item.fontSize / 16}rem)`,
                    ...(item.glowRed && !isActive
                      ? { textShadow: '0 0 18px color-mix(in oklch, var(--primary) 80%, transparent)' }
                      : {}),
                  }}
                >
                  {item.label}
                </span>
              </span>

              {/* "NEW" sticker — anchored to the button so it stays on-screen and unskewed */}
              

              {/* sublabel */}
              <motion.span
                className="hidden font-mono text-xs tracking-[0.3em] text-secondary md:block"
                animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -8 }}
                transition={{ duration: 0.25 }}
              >
                {item.sub}
              </motion.span>
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
        <motion.div
          key={i}
          className="absolute opacity-[0.14]"
          style={{
            width: s.size,
            height: s.size,
            top: s.top,
            left: s.left,
            background: s.color,
            clipPath: s.clip,
          }}
          animate={{ y: [0, -30, 0], rotate: [0, 45, 0] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
