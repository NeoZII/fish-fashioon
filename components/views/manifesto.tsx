'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { ViewShell } from '@/components/view-shell'
import { useT } from '@/lib/prefs'

const SIGNUP_URL = 'https://ikako.vip/r/dqh2u'

export function Manifesto({ onBack }: { onBack: () => void }) {
  const t = useT()
  return (
    <ViewShell index="04" title={t.section.manifesto} subtitle="THE TUTORIAL" accent="primary" onBack={onBack}>
      <div className="mb-10 max-w-xl text-pretty font-mono text-sm leading-relaxed text-muted-foreground">
        {t.manifesto.intro}
      </div>

      <motion.a
        href={SIGNUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-12 flex min-h-[52px] w-full items-center justify-between gap-4 bg-primary px-6 py-4 text-primary-foreground transition-colors hover:bg-foreground hover:text-background sm:w-auto"
      >
        <span className="flex flex-col gap-1 text-left">
          <span className="font-mono text-sm font-bold uppercase tracking-[0.2em]">
            {t.manifesto.cta}
          </span>
          <span className="font-mono text-[11px] font-medium normal-case tracking-[0.08em] opacity-90">
            {t.manifesto.ctaSub}
          </span>
        </span>
        <ArrowUpRight className="size-5 shrink-0" />
      </motion.a>

      <div className="flex flex-col gap-px border-y border-border bg-border">
        {t.manifesto.steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3 bg-background py-6 sm:flex-row sm:gap-6"
          >
            <span className="font-display text-3xl italic leading-none text-primary sm:text-4xl">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-display text-lg italic tracking-wide text-foreground sm:text-xl">
                {s.title}
              </h3>
              <p className="max-w-xl text-pretty font-mono text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </ViewShell>
  )
}
