'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useFavourites } from '@/lib/favourites'
import { useAppNavigate } from '@/components/nav-context'
import { useT } from '@/lib/prefs'

const className =
  'relative flex min-h-[44px] items-center gap-2 border border-border bg-background/60 px-3 font-mono text-[11px] font-bold tracking-[0.2em] text-foreground transition-colors hover:border-fav hover:text-fav'

/** Header shortcut to My Favourites with a live count. */
export function FavouritesLink() {
  const navigate = useAppNavigate()
  const { count } = useFavourites()
  const t = useT()

  const content = (
    <>
      <Heart className={`size-4 ${count ? 'text-fav' : ''}`} fill={count ? 'currentColor' : 'none'} aria-hidden />
      <span className="tabular-nums">{count}</span>
    </>
  )
  const label = t.fav.linkAria(count)

  if (navigate) {
    return (
      <button
        type="button"
        onClick={() => navigate('favourites')}
        aria-label={label}
        className={className}
        style={{ transform: 'skewX(-8deg)' }}
      >
        {content}
      </button>
    )
  }
  return (
    <Link href="/favourites" aria-label={label} className={className} style={{ transform: 'skewX(-8deg)' }}>
      {content}
    </Link>
  )
}
