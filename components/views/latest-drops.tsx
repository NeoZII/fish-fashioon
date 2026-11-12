'use client'

import { useMemo, useState } from 'react'
import { categoryFilters, brandFilters, recentItems, type Product } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'
import { FilterBar } from '@/components/filter-bar'
import { ProductGrid } from '@/components/product-grid'

export function LatestDrops({ items, onBack }: { items: Product[]; onBack: () => void }) {
  const [category, setCategory] = useState<string>('ALL')
  const [brand, setBrand] = useState<string>('ALL')

  // First narrow to the last-7-days feed (date-sorted, newest first).
  const recent = useMemo(() => recentItems(items), [items])

  // Brand options derive from the recent feed so the list stays relevant.
  const brands = useMemo(() => brandFilters(recent), [recent])
  const categories = useMemo(() => categoryFilters(recent), [recent])

  const latest = useMemo(() => {
    return recent.filter(
      (i) =>
        (category === 'ALL' || i.category === category) &&
        (brand === 'ALL' || i.brand === brand),
    )
  }, [recent, category, brand])

  return (
    <ViewShell
      index="01"
      title="LATEST DROPS"
      subtitle="THE FEED"
      accent="primary"
      onBack={onBack}
      toolbar={
        <div className="flex flex-col divide-y divide-border">
          <FilterBar
            label="CATEGORY"
            options={categories}
            active={category}
            onChange={setCategory}
            accent="primary"
          />
          <FilterBar
            label="BRAND"
            options={brands}
            active={brand}
            onChange={setBrand}
            accent="primary"
          />
        </div>
      }
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          {'Everything dropped in the last seven days. Daily updates!'}
        </p>
        <span className="shrink-0 font-mono text-xs tabular-nums text-primary">
          {String(latest.length).padStart(2, '0')} NEW
        </span>
      </div>
      <ProductGrid items={latest} accent="primary" shuffleItems={false} />
    </ViewShell>
  )
}
