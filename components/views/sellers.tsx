'use client'

import { useCallback, useMemo, useState } from 'react'
import { sellerFilters, CATEGORIES, matchesQuery, type Product } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'
import { FilterBar } from '@/components/filter-bar'
import { SearchBar } from '@/components/search-bar'
import { ProductGrid } from '@/components/product-grid'

export function Sellers({ items, onBack }: { items: Product[]; onBack: () => void }) {
  const [seller, setSeller] = useState<string>('ALL')
  const [category, setCategory] = useState<string>('ALL')
  const [query, setQuery] = useState('')

  // Sellers tab only ever deals with rows that have a non-empty Seller (col H).
  const withSeller = useMemo(() => items.filter((i) => i.seller.trim() !== ''), [items])

  const options = useMemo(() => sellerFilters(withSeller), [withSeller])

  const filtered = useMemo(() => {
    return withSeller.filter(
      (i) =>
        (seller === 'ALL' || i.seller === seller) &&
        (category === 'ALL' || i.category === category) &&
        matchesQuery(i, query),
    )
  }, [withSeller, seller, category, query])

  const handleSearch = useCallback((value: string) => setQuery(value), [])

  return (
    <ViewShell
      index="03"
      title="SELLERS"
      subtitle="THE PLUGS"
      accent="primary"
      onBack={onBack}
      toolbar={
        <div className="flex flex-col divide-y divide-border">
          <SearchBar onChange={handleSearch} accent="primary" />
          <FilterBar label="SELLER" options={options} active={seller} onChange={setSeller} accent="primary" />
          <FilterBar
            label="CATEGORY"
            options={[...CATEGORIES]}
            active={category}
            onChange={setCategory}
            accent="primary"
          />
        </div>
      }
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          {'Every plug in one place, every seller verified before they touch the feed.'}
        </p>
        <span className="shrink-0 font-mono text-xs tabular-nums text-primary">
          {String(filtered.length).padStart(2, '0')} ITEMS
        </span>
      </div>
      <ProductGrid
        items={filtered}
        accent="primary"
        emptyMessage={query ? 'NO ITEMS FOUND' : 'NOTHING IN THIS DRAWER YET'}
      />
    </ViewShell>
  )
}
