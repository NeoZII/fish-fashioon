'use client'

import { HelpCircle, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Product, ViewId } from '@/lib/data'
import {
  clearFavourites,
  hasSeenFavouritesIntro,
  markFavouritesIntroSeen,
  removeFavourites,
  useFavourites,
} from '@/lib/favourites'
import { formatMoney, formatYuan, parsePriceNumbers } from '@/lib/money'
import { usePrefs, useT } from '@/lib/prefs'
import { ViewShell } from '@/components/view-shell'
import { ProductGrid } from '@/components/product-grid'
import { FavouritesIntro } from '@/components/favourites-intro'

export function Favourites({
  items,
  loading,
  onBack,
  onNavigate,
}: {
  items: Product[]
  loading: boolean
  onBack: () => void
  onNavigate: (view: ViewId) => void
}) {
  const { list } = useFavourites()
  const t = useT()
  const { lang, currency, rates } = usePrefs()
  const [introOpen, setIntroOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  // First visit: explain how favourites work.
  useEffect(() => {
    if (!hasSeenFavouritesIntro()) setIntroOpen(true)
  }, [])

  const closeIntro = useCallback(() => {
    markFavouritesIntroSeen()
    setIntroOpen(false)
  }, [])

  const browse = useCallback(() => {
    markFavouritesIntroSeen()
    setIntroOpen(false)
    onNavigate('drops')
  }, [onNavigate])

  const byKey = useMemo(() => {
    const map = new Map<string, Product>()
    for (const p of items) if (!map.has(p.key)) map.set(p.key, p)
    return map
  }, [items])

  // Saved order, newest first.
  const saved = useMemo(
    () => list.map((e) => byKey.get(e.k)).filter((p): p is Product => Boolean(p)),
    [list, byKey],
  )
  const missing = useMemo(
    () => (loading || !items.length ? [] : list.filter((e) => !byKey.has(e.k)).map((e) => e.k)),
    [list, byKey, loading, items.length],
  )

  const totals = useMemo(() => {
    let usd = 0
    let cny = 0
    let priced = 0
    for (const p of saved) {
      const n = parsePriceNumbers(p.price, rates)
      if (n.usd) usd += n.usd
      if (n.cny) cny += n.cny
      if (n.usd || n.cny) priced++
    }
    return { usd, cny, priced }
  }, [saved, rates])

  const onClear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      window.setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    clearFavourites()
    setConfirmClear(false)
  }

  return (
    <ViewShell index="06" title={t.section.favourites} subtitle="THE STASH" accent="fav" onBack={onBack} hideFavouritesLink>
      <FavouritesIntro open={introOpen} onClose={closeIntro} onBrowse={browse} />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="font-mono text-sm leading-relaxed text-muted-foreground">
            {saved.length ? t.favPage.savedCount(saved.length) : t.favPage.emptyLine}
            {totals.usd > 0 && (
              <>
                {' '}
                {t.favPage.totalPrefix}{' '}
                <span className="text-fav">{formatMoney(totals.usd, currency, lang, rates)}</span>
                {totals.cny > 0 && <> ({formatYuan(Math.round(totals.cny), lang)})</>} {t.favPage.beforeShipping}
                {totals.priced < saved.length ? ` ${t.favPage.withoutPrice(saved.length - totals.priced)}` : ''}.
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIntroOpen(true)}
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="size-4" aria-hidden />
            {t.favPage.howItWorks}
          </button>
          {list.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className={`flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] ${
                confirmClear ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
              }`}
            >
              <Trash2 className="size-4" aria-hidden />
              {confirmClear ? t.favPage.tapAgain : t.favPage.clearAll}
            </button>
          )}
        </div>
      </div>

      {missing.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-dashed border-border px-4 py-3 font-mono text-xs text-muted-foreground">
          <span>{t.favPage.unavailable(missing.length)}</span>
          <button
            type="button"
            onClick={() => removeFavourites(missing)}
            className="font-bold tracking-[0.2em] text-foreground hover:text-destructive"
          >
            {t.favPage.remove}
          </button>
        </div>
      )}

      {saved.length ? (
        <ProductGrid items={saved} accent="fav" shuffleItems={false} />
      ) : (
        <div className="flex flex-col items-center gap-6 border border-dashed border-border px-6 py-20 text-center">
          <p className="font-mono text-sm tracking-[0.25em] text-muted-foreground">
            {loading && list.length ? t.favPage.loadingFavs : t.favPage.noFavs}
          </p>
          {!(loading && list.length) && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('drops')}
                className="flex min-h-[48px] items-center bg-foreground px-6 font-mono text-xs font-bold tracking-[0.25em] text-background hover:bg-primary hover:text-primary-foreground"
                style={{ transform: 'skewX(-8deg)' }}
              >
                {t.section.drops}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('archive')}
                className="flex min-h-[48px] items-center border border-border px-6 font-mono text-xs font-bold tracking-[0.25em] text-foreground hover:border-fav hover:text-fav"
                style={{ transform: 'skewX(-8deg)' }}
              >
                {t.section.archive}
              </button>
            </div>
          )}
        </div>
      )}
    </ViewShell>
  )
}
