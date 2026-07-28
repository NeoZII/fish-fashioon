'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Clock } from 'lucide-react'
import { SOCIALS } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'

export function Socials({ onBack }: { onBack: () => void }) {
  return (
    <ViewShell index="05" title="SOCIALS" subtitle="THE NETWORK" accent="secondary" onBack={onBack}>
      <div className="mb-10 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
        {'Find me everywhere.'}
      </div>
      <div className="flex flex-col divide-y divide-border border-y border-border">
        {SOCIALS.map((s, i) => {
          const isLive = !s.comingSoon
          const Row = isLive ? motion.a : motion.div
          const linkProps = isLive
            ? { href: s.href, target: '_blank', rel: 'noopener noreferrer' }
            : {}
          return (
            <Row
              key={s.id}
              {...linkProps}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={isLive ? 'hover' : undefined}
              className={`group relative flex items-center justify-between gap-4 overflow-hidden py-6 md:py-8 ${
                isLive ? '' : 'cursor-default'
              }`}
              aria-disabled={isLive ? undefined : true}
            >
              {isLive && (
                <motion.span
                  aria-hidden
                  variants={{ hover: { scaleX: 1 } }}
                  initial={{ scaleX: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 -z-10 origin-left bg-secondary/10"
                />
              )}
              <div className="flex items-baseline gap-4 md:gap-8">
                <span className="font-mono text-xs tabular-nums text-muted-foreground">0{i + 1}</span>
                <span
                  className={`font-display text-4xl italic tracking-wide transition-transform duration-300 md:text-6xl ${
                    isLive
                      ? 'text-foreground group-hover:translate-x-3'
                      : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              <div className="flex items-center gap-4 md:gap-8">
                <div className="text-right">
                  {s.handle && <div className="hidden font-mono text-sm text-foreground sm:block">{s.handle}</div>}
                  {s.meta && (
                    <div className="font-mono text-[11px] tracking-widest text-secondary">{s.meta}</div>
                  )}
                </div>
                {isLive ? (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border transition-colors group-hover:border-secondary group-hover:bg-secondary">
                    <ArrowUpRight className="size-5 text-foreground transition-colors group-hover:text-secondary-foreground" />
                  </span>
                ) : (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-dashed border-border">
                    <Clock className="size-5 text-muted-foreground" />
                  </span>
                )}
              </div>
            </Row>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-12 font-mono text-xs tracking-[0.3em] text-muted-foreground"
      >
        FishFashion — © 2026 ALL SIGNALS RESERVED
      </motion.div>
    </ViewShell>
  )
}
