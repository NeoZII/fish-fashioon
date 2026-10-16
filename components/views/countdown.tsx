'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ViewShell } from '@/components/view-shell'

// ---- Edit the drop here ----------------------------------------------------
const DROP = {
  title: 'BURBERRY PUFFER LINKS',
  // Friday 16 Oct 2026, 20:00 Brussels time (CEST = UTC+2)
  dropAt: '2026-10-16T20:00:00+02:00',
  dateLabel: 'FRIDAY 16 OCT · 20:00',
  // Upload your photo to /public/drops/countdown.jpg (falls back to a placeholder)
  image: '/drops/countdown.png',
  links: [
    { label: 'BURBERRY PUFFER IN BLACK', href: 'https://ikako.vip/muh3c' },
    { label: 'BURBERRY PUFFER IN WHITE', href: 'https://ikako.vip/xchep' },
    { label: 'BURBERRY PUFFER IN PURPLE', href: 'https://ikako.vip/nxpbx' },
  ],
}
// ---------------------------------------------------------------------------

function timeLeft(target: number) {
  const ms = Math.max(0, target - Date.now())
  return {
    done: ms === 0,
    parts: [
      ['DAYS', Math.floor(ms / 86_400_000)],
      ['HRS', Math.floor((ms / 3_600_000) % 24)],
      ['MIN', Math.floor((ms / 60_000) % 60)],
      ['SEC', Math.floor((ms / 1000) % 60)],
    ] as [string, number][],
  }
}

export function Countdown({ onBack }: { onBack: () => void }) {
  const target = new Date(DROP.dropAt).getTime()
  const [t, setT] = useState<ReturnType<typeof timeLeft> | null>(null)
  const [img, setImg] = useState(DROP.image)

  useEffect(() => {
    setT(timeLeft(target))
    const id = window.setInterval(() => setT(timeLeft(target)), 1000)
    return () => window.clearInterval(id)
  }, [target])

  return (
    <ViewShell title={DROP.title} accent="primary" onBack={onBack}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-destructive/40 pb-5">
        <p className="font-mono text-xs font-bold tracking-[0.3em] text-destructive">
          {`DROPS ${DROP.dateLabel}`}
        </p>
        <span className="font-mono text-[10px] font-bold tracking-[0.35em] text-destructive">
          LIMITED RELEASE
        </span>
      </div>

      {/* oversized release timer */}
      <div className="mb-12 min-h-[150px]">
        {t?.done ? (
          <p className="p3-menu-glow font-display text-7xl italic text-destructive md:text-9xl">LIVE NOW</p>
        ) : t ? (
          <div className="flex flex-wrap gap-3 md:gap-4" role="timer">
            {t.parts.map(([label, value], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                className="flex min-w-[78px] flex-1 flex-col items-center border-2 border-destructive/70 bg-destructive/5 px-2 py-4 shadow-[0_0_28px_-12px_var(--color-destructive)] md:min-w-0 md:py-6"
              >
                <span className="font-display text-6xl italic leading-none tabular-nums text-destructive md:text-8xl lg:text-9xl">
                  {String(value).padStart(2, '0')}
                </span>
                <span className="mt-3 font-mono text-[10px] font-bold tracking-[0.25em] text-destructive md:text-xs">{label}</span>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Product links sit directly beneath the countdown. */}
      <div className="mb-8 grid gap-3 md:grid-cols-3">
        {DROP.links.map((link, i) => (
          <motion.a
            key={link.label}
            href={link.href}
            target={link.href !== '#' ? '_blank' : undefined}
            rel={link.href !== '#' ? 'noopener noreferrer' : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
            className="group relative flex min-h-[82px] items-center justify-between gap-4 overflow-hidden bg-primary px-5 py-5 text-primary-foreground shadow-[0_12px_32px_-18px_var(--color-primary)] transition-all duration-300 hover:bg-foreground hover:text-background md:min-h-[96px] md:px-6"
          >
            <span className="absolute -right-10 -top-10 size-28 rounded-full border border-current/20" aria-hidden />
            <span className="relative max-w-[15rem] font-mono text-xs font-bold uppercase leading-[1.8] tracking-[0.15em]">
              {link.label}
            </span>
            <ArrowUpRight className="relative size-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </motion.a>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        {/* product image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="group relative aspect-[4/5] w-full overflow-hidden border-2 border-destructive/50 bg-white shadow-[0_0_44px_-12px_var(--color-destructive)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={DROP.title}
            onError={() => setImg('/placeholder.jpg')}
            className="h-full w-full object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute left-0 top-0 bg-destructive px-4 py-2 font-mono text-[11px] font-bold tracking-[0.2em] text-destructive-foreground">
            COMING SOON
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent px-5 pb-5 pt-16">
            <p className="font-mono text-xs font-bold tracking-[0.3em] text-white">BURBERRY PUFFER</p>
          </div>
        </motion.div>

      </div>
    </ViewShell>
  )
}
