'use client'

import { CalendarDays, Flame } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { recentItems, type Product } from '@/lib/data'
import { useT } from '@/lib/prefs'
import { useTrending } from '@/lib/trending'
import { ViewShell } from '@/components/view-shell'
import { ProductGrid } from '@/components/product-grid'
import { LoadingScreen } from '@/components/loading-screen'

/** Below this many trending items, show the newest drops instead. */
const MIN_ITEMS = 4

export function Trending({ items, loading, onBack }: { items: Product[]; loading: boolean; onBack: () => void }) {
  const t = useT()
  const trending = useTrending()

  const ranked = useMemo(() => {
    const byKey = new Map(items.map((p) => [p.key, p]))
    return trending.items.map((i) => byKey.get(i.key)).filter((p): p is Product => Boolean(p))
  }, [items, trending.items])

  const warming = trending.loaded && ranked.length < MIN_ITEMS
  const fallback = useMemo(() => (warming ? recentItems(items).slice(0, 32) : []), [warming, items])

  if (loading || !trending.loaded) return <LoadingScreen />

  return (
    <ViewShell index="02" title={t.section.trending} subtitle="THE HEAT" accent="primary" onBack={onBack}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <p className="flex max-w-xl items-start gap-2 font-mono text-sm leading-relaxed text-muted-foreground">
          <Flame className="mt-0.5 size-4 shrink-0 text-orange-400" fill="currentColor" strokeWidth={0} aria-hidden />
          {warming ? t.trending.warming : t.trending.intro}
        </p>
        <Link
          href="/week"
          className="flex min-h-[44px] items-center gap-2 border border-border px-4 font-mono text-[11px] font-bold tracking-[0.2em] text-foreground hover:border-primary hover:text-primary"
          style={{ transform: 'skewX(-8deg)' }}
        >
          <CalendarDays className="size-4" aria-hidden />
          {t.week.latestLink}
        </Link>
      </div>
      <ProductGrid items={warming ? fallback : ranked} accent="primary" shuffleItems={false} />
    </ViewShell>
  )
}
