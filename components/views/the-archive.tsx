'use client'

import { useMemo, useState } from 'react'
import { CATEGORIES, brandFilters, type Product } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'
import { FilterBar } from '@/components/filter-bar'
import { ProductGrid } from '@/components/product-grid'

export function TheArchive({ items, onBack }: { items: Product[]; onBack: () => void }) {
  const [category, setCategory] = useState<string>('ALL')
  const [brand, setBrand] = useState<string>('ALL')

  const brands = useMemo(() => brandFilters(items), [items])

  const filtered = useMemo(() => {
    return items.filter(
      (i) =>
        (category === 'ALL' || i.category === category) &&
        (brand === 'ALL' || i.brand === brand),
    )
  }, [items, category, brand])

  return (
    <ViewShell
      index="02"
      title="THE ARCHIVE"
      subtitle="THE GALLERY"
      accent="secondary"
      onBack={onBack}
      toolbar={
        <div className="flex flex-col divide-y divide-border">
          <FilterBar
            label="CATEGORY"
            options={[...CATEGORIES]}
            active={category}
            onChange={setCategory}
            accent="secondary"
          />
          <FilterBar
            label="BRAND"
            options={brands}
            active={brand}
            onChange={setBrand}
            accent="secondary"
          />
        </div>
      }
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          {'A collected memory. Every artifact catalogued, every frame preserved in the dark.'}
        </p>
        <span className="shrink-0 font-mono text-xs tabular-nums text-secondary">
          {String(filtered.length).padStart(2, '0')} ITEMS
        </span>
      </div>
      <ProductGrid items={filtered} accent="secondary" />
    </ViewShell>
  )
}
