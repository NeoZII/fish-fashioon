'use client'

import { motion } from 'framer-motion'
import { ARCHIVE } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'

export function TheArchive({ onBack }: { onBack: () => void }) {
  return (
    <ViewShell index="02" title="THE ARCHIVE" subtitle="THE GALLERY" accent="secondary" onBack={onBack}>
      <div className="mb-8 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
        {'A collected memory. Every artifact catalogued, every frame preserved in the dark.'}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {ARCHIVE.map((item, i) => (
          <motion.figure
            key={item.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02 }}
            className={`group relative overflow-hidden border border-border bg-card ${
              i % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''
            }`}
          >
            <div className={i % 5 === 0 ? 'aspect-square md:aspect-[4/3]' : 'aspect-square'}>
              <img
                src={item.image || '/placeholder.svg'}
                alt={item.title}
                className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
              <span className="font-display text-lg italic leading-none tracking-wide text-foreground">
                {item.title}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-secondary">{item.year}</span>
            </figcaption>
            <span className="absolute right-2 top-2 skew-x-[-8deg] bg-secondary/90 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-secondary-foreground opacity-0 transition-opacity group-hover:opacity-100">
              VIEW
            </span>
          </motion.figure>
        ))}
      </div>
    </ViewShell>
  )
}
