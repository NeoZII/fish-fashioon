'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { ShareButton } from '@/components/share-button'

export function ViewShell({
  title,
  accent = 'primary',
  onBack,
  toolbar,
  children,
}: {
  /** Menu position (e.g. "02"); accepted for compatibility, not rendered. */
  index?: string
  title: string
  /** Menu sub-label (e.g. "THE GALLERY"); accepted for compatibility, not rendered. */
  subtitle?: string
  accent?: 'primary' | 'secondary'
  onBack: () => void
  toolbar?: ReactNode
  children: ReactNode
}) {
  const barClass = accent === 'primary' ? 'bg-primary' : 'bg-secondary'

  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      <div className="p3-stripes pointer-events-none absolute inset-0 opacity-40" />

      {/* sticky header + optional toolbar */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95">
        <header className="flex items-center justify-between gap-4 px-4 py-4 md:px-10">
          <button
            type="button"
            onClick={onBack}
            className="group flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            MENU
          </button>
          <ShareButton title={`${title} · Fashion Sea`} />
        </header>
        {toolbar ? <div className="border-t border-border">{toolbar}</div> : null}
      </div>

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
