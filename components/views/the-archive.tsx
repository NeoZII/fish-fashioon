'use client'

import { useCallback, useMemo, useState } from 'react'
import { categoryFilters, brandFilters, type Product } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'
import { searchItems } from '@/lib/search'
import { FilterBar } from '@/components/filter-bar'
import { MobileFilters } from '@/components/mobile-filters'
import { SearchBar } from '@/components/search-bar'
import { ProductGrid } from '@/components/product-grid'
import { useT } from '@/lib/prefs'
import { categoryLabel } from '@/lib/i18n'

export function TheArchive({ items, onBack }: { items: Product[]; onBack: () => void }) {
  const [category, setCategory] = useState<string>('ALL')
  const [brand, setBrand] = useState<string>('ALL')
  const [query, setQuery] = useState('')
  const t = useT()
  const catLabel = (c: string) => categoryLabel(t, c)

  const brands = useMemo(() => brandFilters(items), [items])
  const categories = useMemo(() => categoryFilters(items), [items])

  // Search the whole catalogue first (its index is cached), best match first,
  // then apply the category/brand filters.
  const filtered = useMemo(() => {
    return searchItems(items, query).filter(
      (i) =>
        (category === 'ALL' || i.category === category) &&
        (brand === 'ALL' || i.brand === brand),
    )
  }, [items, category, brand, query])

  const handleSearch = useCallback((value: string) => setQuery(value), [])

  return (
    <ViewShell
      index="02"
      title={t.section.archive}
      subtitle="THE GALLERY"
      accent="secondary"
      onBack={onBack}
      toolbar={
        <div className="flex flex-col divide-y divide-border">
          <SearchBar onChange={handleSearch} accent="secondary" placeholder={t.common.searchPlaceholder} />
          <div className="hidden flex-col divide-y divide-border md:flex">
            <FilterBar
              label={t.common.category}
              options={categories}
              active={category}
              onChange={setCategory}
              accent="secondary"
              formatOption={catLabel}
            />
            <FilterBar
              label={t.common.brand}
              options={brands}
              active={brand}
              onChange={setBrand}
              accent="secondary"
            />
          </div>
          <MobileFilters
            accent="secondary"
            resultCount={filtered.length}
            groups={[
              {
                id: 'category',
                label: t.common.category,
                options: categories,
                active: category,
                onChange: setCategory,
                formatOption: catLabel,
              },
              {
                id: 'brand',
                label: t.common.brand,
                options: brands,
                active: brand,
                onChange: setBrand,
                searchable: true,
                searchPlaceholder: t.filters.findBrand,
              },
            ]}
          />
        </div>
      }
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          {t.archive.intro(items.length)}
        </p>
        <span className="shrink-0 font-mono text-xs tabular-nums text-secondary">
          {filtered.length < 10 ? '0' : ''}
          {t.common.items(filtered.length)}
        </span>
      </div>
      <ProductGrid
        items={filtered}
        accent="secondary"
        // While searching, keep best-match order instead of shuffling.
        shuffleItems={!query}
        showShuffle={!query}
        emptyMessage={query ? t.common.noItemsFound : t.common.emptyDrawer}
      />
    </ViewShell>
  )
}
