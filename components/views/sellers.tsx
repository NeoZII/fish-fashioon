'use client'

import { useCallback, useMemo, useState } from 'react'
import { sellerFilters, categoryFilters, type Product } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'
import { searchItems } from '@/lib/search'
import { FilterBar } from '@/components/filter-bar'
import { MobileFilters } from '@/components/mobile-filters'
import { SearchBar } from '@/components/search-bar'
import { ProductGrid } from '@/components/product-grid'
import { useT } from '@/lib/prefs'
import { categoryLabel } from '@/lib/i18n'

export function Sellers({ items, onBack }: { items: Product[]; onBack: () => void }) {
  const [seller, setSeller] = useState<string>('ALL')
  const [category, setCategory] = useState<string>('ALL')
  const [query, setQuery] = useState('')
  const t = useT()
  const catLabel = (c: string) => categoryLabel(t, c)

  // Sellers tab only ever deals with rows that have a non-empty Seller (col H).
  const withSeller = useMemo(() => items.filter((i) => i.seller.trim() !== ''), [items])

  const options = useMemo(() => sellerFilters(withSeller), [withSeller])
  const categories = useMemo(() => categoryFilters(withSeller), [withSeller])

  const filtered = useMemo(() => {
    return searchItems(withSeller, query).filter(
      (i) =>
        (seller === 'ALL' || i.seller === seller) &&
        (category === 'ALL' || i.category === category),
    )
  }, [withSeller, seller, category, query])

  const handleSearch = useCallback((value: string) => setQuery(value), [])

  return (
    <ViewShell
      index="03"
      title={t.section.sellers}
      subtitle="THE PLUGS"
      accent="primary"
      onBack={onBack}
      toolbar={
        <div className="flex flex-col divide-y divide-border">
          <SearchBar onChange={handleSearch} accent="primary" placeholder={t.common.searchPlaceholder} />
          <div className="hidden flex-col divide-y divide-border md:flex">
            <FilterBar label={t.common.seller} options={options} active={seller} onChange={setSeller} accent="primary" />
            <FilterBar
              label={t.common.category}
              options={categories}
              active={category}
              onChange={setCategory}
              accent="primary"
              formatOption={catLabel}
            />
          </div>
          <MobileFilters
            accent="primary"
            resultCount={filtered.length}
            groups={[
              {
                id: 'seller',
                label: t.common.seller,
                options: options,
                active: seller,
                onChange: setSeller,
                searchable: true,
                searchPlaceholder: t.filters.findSeller,
              },
              {
                id: 'category',
                label: t.common.category,
                options: categories,
                active: category,
                onChange: setCategory,
                formatOption: catLabel,
              },
            ]}
          />
        </div>
      }
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          {t.sellers.intro}
        </p>
        <span className="shrink-0 font-mono text-xs tabular-nums text-primary">
          {filtered.length < 10 ? '0' : ''}
          {t.common.items(filtered.length)}
        </span>
      </div>
      <ProductGrid
        items={filtered}
        accent="primary"
        shuffleItems={!query}
        emptyMessage={query ? t.common.noItemsFound : t.common.emptyDrawer}
      />
    </ViewShell>
  )
}
