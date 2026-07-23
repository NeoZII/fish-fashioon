'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

export function ViewShell({
  index,
  title,
  subtitle,
  accent = 'primary',
  onBack,
  children,
}: {
  index: string
  title: string
  subtitle: string
  accent?: 'primary' | 'secondary'
  onBack: () => void
  children: ReactNode
}) {
  const accentClass = accent === 'primary' ? 'text-primary' : 'text-secondary'
  const barClass = accent === 'primary' ? 'bg-primary' : 'bg-secondary'

  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      <div className="p3-stripes pointer-events-none absolute inset-0 opacity-40" />

      {/* header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/70 px-4 py-4 backdrop-blur-md md:px-10">
        <button
          type="button"
          onClick={onBack}
          className="group flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          MENU
        </button>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-xs tracking-[0.25em] ${accentClass}`}>{subtitle}</span>
          <span className={`h-4 w-[2px] ${barClass}`} />
          <span className="font-mono text-xs tabular-nums text-muted-foreground">{index}</span>
        </div>
      </header>

      {/* big tilted title */}
      <div className="relative overflow-hidden px-4 pb-2 pt-10 md:px-10 md:pt-16">
        <motion.h1
          initial={{ opacity: 0, x: -60, skewX: -8 }}
          animate={{ opacity: 1, x: 0, skewX: -6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[15vw] italic leading-[0.8] tracking-tight text-foreground md:text-[9vw]"
        >
          {title}
        </motion.h1>
        <div className={`mt-3 h-1 w-32 ${barClass}`} />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative z-10 px-4 pb-24 pt-8 md:px-10"
      >
        {children}
      </motion.main>
    </div>
  )
}
