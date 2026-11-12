'use client'

import { useCallback, useMemo, useState } from 'react'
import { categoryFilters, brandFilters, matchesQuery, type Product } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'
import { FilterBar } from '@/components/filter-bar'
import { SearchBar } from '@/components/search-bar'
import { ProductGrid } from '@/components/product-grid'

export function TheArchive({ items, onBack }: { items: Product[]; onBack: () => void }) {
  const [category, setCategory] = useState<string>('ALL')
  const [brand, setBrand] = useState<string>('ALL')
  const [query, setQuery] = useState('')

  const brands = useMemo(() => brandFilters(items), [items])
  const categories = useMemo(() => categoryFilters(items), [items])

  const filtered = useMemo(() => {
    return items.filter(
      (i) =>
        (category === 'ALL' || i.category === category) &&
        (brand === 'ALL' || i.brand === brand) &&
        matchesQuery(i, query),
    )
  }, [items, category, brand, query])

  const handleSearch = useCallback((value: string) => setQuery(value), [])

  return (
    <ViewShell
      index="02"
      title="ALL ITEMS"
      subtitle="THE GALLERY"
      accent="secondary"
      onBack={onBack}
      toolbar={
        <div className="flex flex-col divide-y divide-border">
          <SearchBar onChange={handleSearch} accent="secondary" />
          <FilterBar
            label="CATEGORY"
            options={categories}
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
          {`Every item catalogued: ${items.length.toLocaleString('en-US')} finds and more added daily.`}
        </p>
        <span className="shrink-0 font-mono text-xs tabular-nums text-secondary">
          {String(filtered.length).padStart(2, '0')} ITEMS
        </span>
      </div>
      <ProductGrid
        items={filtered}
        accent="secondary"
        showShuffle
        emptyMessage={query ? 'NO ITEMS FOUND' : 'NOTHING IN THIS DRAWER YET'}
      />
    </ViewShell>
  )
}
