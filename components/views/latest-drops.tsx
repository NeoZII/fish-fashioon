'use client'

import { useMemo, useState } from 'react'
import { categoryFilters, brandFilters, recentItems, type Product } from '@/lib/data'
import { ViewShell } from '@/components/view-shell'
import { FilterBar } from '@/components/filter-bar'
import { MobileFilters } from '@/components/mobile-filters'
import { ProductGrid } from '@/components/product-grid'
import { useT } from '@/lib/prefs'
import { categoryLabel } from '@/lib/i18n'

export function LatestDrops({ items, onBack }: { items: Product[]; onBack: () => void }) {
  const [category, setCategory] = useState<string>('ALL')
  const [brand, setBrand] = useState<string>('ALL')
  const t = useT()
  const catLabel = (c: string) => categoryLabel(t, c)

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
      title={t.section.drops}
      subtitle="THE FEED"
      accent="primary"
      onBack={onBack}
      toolbar={
        <div className="flex flex-col divide-y divide-border">
          <div className="hidden flex-col divide-y divide-border md:flex">
            <FilterBar
              label={t.common.category}
              options={categories}
              active={category}
              onChange={setCategory}
              accent="primary"
              formatOption={catLabel}
            />
            <FilterBar
              label={t.common.brand}
              options={brands}
              active={brand}
              onChange={setBrand}
              accent="primary"
            />
          </div>
          <MobileFilters
            accent="primary"
            resultCount={latest.length}
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
          {t.drops.intro}
        </p>
        <span className="shrink-0 font-mono text-xs tabular-nums text-primary">
          {latest.length < 10 ? '0' : ''}
          {t.common.newCount(latest.length)}
        </span>
      </div>
      <ProductGrid items={latest} accent="primary" shuffleItems={false} />
    </ViewShell>
  )
}
