'use client'

import { Check, Heart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/lib/data'
import { addFavourites, useFavourites } from '@/lib/favourites'
import type { FxRates } from '@/lib/money'
import { setRates, useT } from '@/lib/prefs'
import { ViewShell } from '@/components/view-shell'
import { ProductGrid } from '@/components/product-grid'
import { isLandingPage } from '@/components/landing-tracker'

/** A favourites list someone shared: view it, save it all to your own favourites. */
export function SharedList({
  items,
  missing,
  shareUrl,
  rates,
}: {
  items: Product[]
  /** Items in the link that are no longer in the catalogue. */
  missing: number
  shareUrl: string
  rates: FxRates | null
}) {
  const t = useT()
  const router = useRouter()
  const { keys: mine } = useFavourites()
  const [added, setAdded] = useState<number | null>(null)

  useEffect(() => {
    setRates(rates)
  }, [rates])

  const notSaved = useMemo(() => items.filter((p) => !mine.has(p.key)).length, [items, mine])

  // Arrived from a shared link: Back goes to the menu instead of leaving the site.
  const goBack = () => {
    if (isLandingPage()) router.push('/')
    else router.back()
  }

  const saveAll = () => setAdded(addFavourites(items.map((p) => p.key)))

  const status =
    added !== null ? (added > 0 ? t.shared.added(added) : t.shared.allThere) : notSaved === 0 && items.length ? t.shared.allThere : null

  return (
    <ViewShell
      title={t.shared.title}
      accent="fav"
      onBack={goBack}
      shareUrl={shareUrl}
      shareTitle={`${t.shared.title} (${items.length}) · Fashion Sea`}
      sharePreview={`${new URL(shareUrl).pathname}/opengraph-image`}
    >
      <div className="mb-8 flex flex-col gap-5">
        <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">{t.shared.lead(items.length)}</p>

        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {notSaved > 0 && (
              <button
                type="button"
                onClick={saveAll}
                className="flex min-h-[48px] items-center gap-2 bg-fav px-6 font-mono text-xs font-bold tracking-[0.2em] text-fav-foreground transition-[filter] hover:brightness-110"
                style={{ transform: 'skewX(-8deg)' }}
              >
                <Heart className="size-4" fill="currentColor" aria-hidden />
                {t.shared.saveAll}
              </button>
            )}
            <Link
              href="/favourites"
              className="flex min-h-[48px] items-center border border-border px-6 font-mono text-xs font-bold tracking-[0.2em] text-foreground hover:border-fav hover:text-fav"
              style={{ transform: 'skewX(-8deg)' }}
            >
              {t.shared.openMine}
            </Link>
          </div>
        )}

        {status && (
          <p role="status" className="flex items-center gap-2 font-mono text-xs tracking-wide text-fav">
            <Check className="size-4" aria-hidden />
            {status}
          </p>
        )}
      </div>

      {missing > 0 && (
        <div className="mb-6 border border-dashed border-border px-4 py-3 font-mono text-xs text-muted-foreground">
          {t.shared.unavailable(missing)}
        </div>
      )}

      {items.length ? (
        <ProductGrid items={items} accent="fav" shuffleItems={false} />
      ) : (
        <div className="flex flex-col items-center gap-6 border border-dashed border-border px-6 py-20 text-center">
          <p className="font-mono text-sm tracking-[0.25em] text-muted-foreground">{t.shared.empty}</p>
          <Link
            href="/all"
            className="flex min-h-[48px] items-center bg-foreground px-6 font-mono text-xs font-bold tracking-[0.25em] text-background hover:bg-primary hover:text-primary-foreground"
            style={{ transform: 'skewX(-8deg)' }}
          >
            {t.notFound.browseAll}
          </Link>
        </div>
      )}
    </ViewShell>
  )
}
