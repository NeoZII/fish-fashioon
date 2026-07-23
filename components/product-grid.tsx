'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Product } from '@/lib/data'

export function ProductGrid({
  items,
  accent = 'primary',
}: {
  items: Product[]
  accent?: 'primary' | 'secondary'
}) {
  if (items.length === 0) {
    return (
      <div className="border border-dashed border-border py-24 text-center font-mono text-sm tracking-[0.25em] text-muted-foreground">
        NOTHING IN THIS DRAWER YET
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {items.map((item, i) => (
        <ProductCard key={item.id} product={item} index={i} accent={accent} />
      ))}
    </div>
  )
}

function ProductCard({
  product,
  index,
  accent,
}: {
  product: Product
  index: number
  accent: 'primary' | 'secondary'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: -py * 8, ry: px * 8 })
  }

  const tagClass = accent === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
  const priceClass = accent === 'primary' ? 'text-primary' : 'text-secondary'

  return (
    <motion.div
      initial={{ opacity: 0, y: 34 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index, 12) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="group flex h-full flex-col overflow-hidden rounded-md border border-border bg-card"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent" />
          <span
            className={`absolute left-2 top-2 skew-x-[-8deg] px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.2em] ${tagClass}`}
          >
            {product.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3" style={{ transform: 'translateZ(24px)' }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {product.brand}
          </span>
          <h3 className="font-display text-base italic leading-tight tracking-wide text-foreground text-balance">
            {product.title}
          </h3>
          <div className="mt-auto flex items-center justify-between pt-3">
            <span className={`font-mono text-sm font-bold tabular-nums ${priceClass}`}>
              {product.price}
            </span>
            <a
              href={product.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex skew-x-[-8deg] items-center gap-1 bg-foreground px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-background transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label={`Buy ${product.title}`}
            >
              BUY
              <ArrowUpRight className="size-3" />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
