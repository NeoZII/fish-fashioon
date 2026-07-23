'use client'

import { motion } from 'framer-motion'
import { Heart, Music2, Play } from 'lucide-react'
import { useRef, useState } from 'react'
import { DROPS, type Drop } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'

export function LatestDrops({ onBack }: { onBack: () => void }) {
  return (
    <ViewShell index="01" title="LATEST DROPS" subtitle="THE FEED" accent="primary" onBack={onBack}>
      <div className="mb-8 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
        {'Fresh from the void. New clips, cuts and rituals — updated when the moon says so.'}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DROPS.map((drop, i) => (
          <DropCard key={drop.id} drop={drop} index={i} />
        ))}
      </div>
    </ViewShell>
  )
}

function DropCard({ drop, index }: { drop: Drop; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: -py * 12, ry: px * 12 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="group relative aspect-[9/13] cursor-pointer overflow-hidden rounded-md border border-border bg-card"
      >
        <img
          src={drop.image || '/placeholder.svg'}
          alt={drop.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* tag */}
        <span className="absolute left-3 top-3 skew-x-[-8deg] bg-primary px-2 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-primary-foreground">
          {drop.tag}
        </span>

        {/* play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="flex size-14 items-center justify-center rounded-full border border-foreground/40 bg-background/30 backdrop-blur-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
          >
            <Play className="size-6 translate-x-0.5 fill-foreground text-foreground" />
          </motion.span>
        </div>

        {/* meta */}
        <div className="absolute inset-x-0 bottom-0 p-4" style={{ transform: 'translateZ(30px)' }}>
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <Music2 className="size-3 text-secondary" />
            {drop.handle}
          </div>
          <h3 className="font-display text-2xl italic leading-none tracking-wide text-foreground">
            {drop.title}
          </h3>
          <div className="mt-2 flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Play className="size-3 fill-current" /> {drop.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="size-3 fill-primary text-primary" /> {drop.likes}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
