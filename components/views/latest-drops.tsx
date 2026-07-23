'use client'

import type { Product } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'
import { ProductGrid } from '@/components/product-grid'

export function LatestDrops({ items, onBack }: { items: Product[]; onBack: () => void }) {
  const latest = items.slice(0, 20)

  return (
    <ViewShell index="01" title="LATEST DROPS" subtitle="THE FEED" accent="primary" onBack={onBack}>
      <div className="mb-8 flex items-end justify-between gap-4">
        <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          {'Fresh from the void. The twenty newest additions to the feed — updated when the moon says so.'}
        </p>
        <span className="shrink-0 font-mono text-xs tabular-nums text-primary">
          {String(latest.length).padStart(2, '0')} NEW
        </span>
      </div>
      <ProductGrid items={latest} accent="primary" />
    </ViewShell>
  )
}
