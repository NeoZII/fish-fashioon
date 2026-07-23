'use client'

import { motion } from 'framer-motion'
import { ViewShell } from '@/components/view-shell'

const LINES = [
  'WE MAKE THINGS FOR',
  'THE HOURS AFTER',
  'MIDNIGHT.',
]

const CREED = [
  { k: '01', v: 'No apologies. The work is loud, sharp and unafraid of the dark.' },
  { k: '02', v: 'Every frame is a ritual. Nothing shipped that we would not watch twice.' },
  { k: '03', v: 'Community over algorithm. The network is the whole point.' },
]

export function Manifesto({ onBack }: { onBack: () => void }) {
  return (
    <ViewShell index="03" title="MANIFESTO" subtitle="WHO WE ARE" accent="primary" onBack={onBack}>
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="mb-10">
            {LINES.map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-4xl italic leading-[0.95] tracking-tight text-foreground md:text-6xl"
                style={{ color: i === 2 ? 'var(--primary)' : undefined }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          <div className="space-y-5 border-l-2 border-primary pl-5">
            {CREED.map((c, i) => (
              <motion.div
                key={c.k}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className="flex gap-4"
              >
                <span className="font-mono text-sm text-secondary">{c.k}</span>
                <p className="max-w-md text-pretty font-mono text-sm leading-relaxed text-muted-foreground">
                  {c.v}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative aspect-[3/4] overflow-hidden border border-border"
        >
          <img
            src="/manifesto.png"
            alt="A lone figure under a crimson spotlight in a brutalist concrete space"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
          <span className="absolute bottom-4 left-4 font-display text-xl italic tracking-widest text-foreground">
            EST. AFTER DARK
          </span>
        </motion.div>
      </div>
    </ViewShell>
  )
}
