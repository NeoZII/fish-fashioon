'use client'

import { ArrowLeft, ArrowRight, Flame } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import type { WeekData } from '@/lib/week-lookup'
import { localeFor, type FxRates } from '@/lib/money'
import { setRates, usePrefs, useT } from '@/lib/prefs'
import { ViewShell } from '@/components/view-shell'
import { ProductGrid } from '@/components/product-grid'
import { isLandingPage } from '@/components/landing-tracker'

function dayDate(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12))
}

/** "This week's drops" page: every find added Monday–Sunday, most wanted first. */
export function WeeklyDrops({ data, rates }: { data: WeekData; rates: FxRates | null }) {
  const t = useT()
  const { lang } = usePrefs()
  const router = useRouter()
  const { week, items, top, prevId, nextId } = data

  useEffect(() => {
    setRates(rates)
  }, [rates])

  const range = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(localeFor(lang), { day: 'numeric', month: 'short', timeZone: 'UTC' })
    // Node and browsers don't agree on the spaces around the dash (thin vs
    // normal), which made the server HTML and the browser disagree (React
    // hydration error #418): always use plain spaces.
    const plain = (text: string) => text.replace(/[\u2009\u202f\u00a0]/g, ' ')
    try {
      return plain(fmt.formatRange(dayDate(week.start), dayDate(week.end)))
    } catch {
      return plain(`${fmt.format(dayDate(week.start))} – ${fmt.format(dayDate(week.end))}`)
    }
  }, [lang, week.start, week.end])

  const goBack = () => {
    if (isLandingPage()) router.push('/latest')
    else router.back()
  }

  const nav =
    'flex min-h-[44px] items-center gap-2 border border-border px-4 font-mono text-[11px] font-bold tracking-[0.2em] text-foreground hover:border-primary hover:text-primary'

  return (
    <ViewShell title={t.week.title(week.week)} accent="primary" onBack={goBack}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">{t.week.lead(items.length, range)}</p>
        <div className="flex gap-3">
          <Link href={`/week/${prevId}`} className={nav} style={{ transform: 'skewX(-8deg)' }}>
            <ArrowLeft className="size-4" aria-hidden />
            {t.week.prev}
          </Link>
          {nextId && (
            <Link href={`/week/${nextId}`} className={nav} style={{ transform: 'skewX(-8deg)' }}>
              {t.week.next}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>

      {top.length >= 3 && (
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2 font-mono text-xs font-bold tracking-[0.25em] text-foreground">
            <Flame className="size-4 text-orange-400" fill="currentColor" strokeWidth={0} aria-hidden />
            {t.week.top}
          </h2>
          <ProductGrid items={top} accent="primary" shuffleItems={false} />
        </section>
      )}

      <section>
        {top.length >= 3 && (
          <h2 className="mb-4 font-mono text-xs font-bold tracking-[0.25em] text-foreground">{t.week.all}</h2>
        )}
        <ProductGrid items={items} accent="primary" shuffleItems={false} emptyMessage={t.week.empty} />
      </section>
    </ViewShell>
  )
}
