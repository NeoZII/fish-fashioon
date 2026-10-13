'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ViewShell } from '@/components/view-shell'

// ---- Edit the drop here ----------------------------------------------------
const DROP = {
  title: 'PUFFER DROP',
  // Friday 16 Oct 2026, 20:00 Brussels time (CEST = UTC+2)
  dropAt: '2026-10-16T20:00:00+02:00',
  dateLabel: 'FRIDAY 16 OCT · 20:00',
  // Upload your photo to /public/drops/countdown.jpg (falls back to a placeholder)
  image: '/drops/countdown.jpg',
  ctaText: 'CREATE AN ACCOUNT TO BE ABLE TO BUY WHEN IT DROPS',
  ctaLink: 'https://ikako.vip/r/dqh2u',
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
      <p className="mb-6 font-mono text-xs tracking-[0.3em] text-muted-foreground">
        {`DROPS ${DROP.dateLabel}`}
      </p>

      {/* timer */}
      <div className="mb-10 min-h-[104px]">
        {t?.done ? (
          <p className="p3-menu-glow font-display text-6xl italic text-primary md:text-7xl">LIVE NOW</p>
        ) : t ? (
          <div className="flex flex-wrap gap-3 md:gap-4" role="timer">
            {t.parts.map(([label, value], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                className="flex w-[76px] flex-col items-center border border-border bg-background/80 py-3 md:w-28"
              >
                <span className="font-display text-5xl italic leading-none tabular-nums text-foreground md:text-7xl">
                  {String(value).padStart(2, '0')}
                </span>
                <span className="mt-2 font-mono text-[10px] tracking-[0.25em] text-primary">{label}</span>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        {/* product image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-muted"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={DROP.title}
            onError={() => setImg('/placeholder.jpg')}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-0 top-0 bg-primary px-3 py-1 font-mono text-[11px] font-bold tracking-[0.2em] text-primary-foreground">
            COMING SOON
          </div>
        </motion.div>

        {/* CTA */}
        <motion.a
          href={DROP.ctaLink}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex min-h-[72px] w-full items-center justify-between gap-4 bg-primary px-6 py-5 text-primary-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          <span className="font-mono text-sm font-bold uppercase leading-relaxed tracking-[0.15em]">
            {DROP.ctaText}
          </span>
          <ArrowUpRight className="size-6 shrink-0" />
        </motion.a>
      </div>
    </ViewShell>
  )
}
