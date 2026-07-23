'use client'

import { useMemo, useState } from 'react'
import { sellerFilters, type Product } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'
import { FilterBar } from '@/components/filter-bar'
import { ProductGrid } from '@/components/product-grid'

export function Sellers({ items, onBack }: { items: Product[]; onBack: () => void }) {
  const [seller, setSeller] = useState<string>('ALL')

  const options = useMemo(() => sellerFilters(items), [items])

  const filtered = useMemo(() => {
    if (seller === 'ALL') return items
    return items.filter((i) => i.seller === seller)
  }, [items, seller])

  return (
    <ViewShell
      index="03"
      title="SELLERS"
      subtitle="THE PLUGS"
      accent="primary"
      onBack={onBack}
      toolbar={
        <FilterBar options={options} active={seller} onChange={setSeller} accent="primary" />
      }
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          {'The trusted network. Every plug vetted, every seller verified before they touch the feed.'}
        </p>
        <span className="shrink-0 font-mono text-xs tabular-nums text-primary">
          {String(filtered.length).padStart(2, '0')} ITEMS
        </span>
      </div>
      <ProductGrid items={filtered} accent="primary" />
    </ViewShell>
  )
}
