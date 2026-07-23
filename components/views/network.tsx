'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { SOCIALS } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'

export function Network({ onBack }: { onBack: () => void }) {
  return (
    <ViewShell index="04" title="NETWORK" subtitle="THE SOCIALS" accent="secondary" onBack={onBack}>
      <div className="mb-10 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
        {'Find us everywhere the signal reaches. Tap in — the network never sleeps.'}
      </div>
      <div className="flex flex-col divide-y divide-border border-y border-border">
        {SOCIALS.map((s, i) => (
          <motion.a
            key={s.id}
            href={s.href}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover="hover"
            className="group relative flex items-center justify-between gap-4 overflow-hidden py-6 md:py-8"
          >
            <motion.span
              aria-hidden
              variants={{ hover: { scaleX: 1 } }}
              initial={{ scaleX: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 -z-10 origin-left bg-secondary/10"
            />
            <div className="flex items-baseline gap-4 md:gap-8">
              <span className="font-mono text-xs tabular-nums text-muted-foreground">0{i + 1}</span>
              <span className="font-display text-4xl italic tracking-wide text-foreground transition-transform duration-300 group-hover:translate-x-3 md:text-6xl">
                {s.label}
              </span>
            </div>
            <div className="flex items-center gap-4 md:gap-8">
              <div className="hidden text-right sm:block">
                <div className="font-mono text-sm text-foreground">{s.handle}</div>
                <div className="font-mono text-[11px] tracking-widest text-secondary">{s.meta}</div>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border transition-colors group-hover:border-secondary group-hover:bg-secondary">
                <ArrowUpRight className="size-5 text-foreground transition-colors group-hover:text-secondary-foreground" />
              </span>
            </div>
          </motion.a>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-12 font-mono text-xs tracking-[0.3em] text-muted-foreground"
      >
        NOX // PERSONA — © 2026 ALL SIGNALS RESERVED
      </motion.div>
    </ViewShell>
  )
}
