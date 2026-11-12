'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { toggleFavourite, useFavourites } from '@/lib/favourites'

/** Heart toggle for one item. `variant="card"` is the round icon on product cards. */
export function FavouriteButton({
  itemKey,
  title,
  variant = 'card',
  className = '',
}: {
  itemKey: string
  title: string
  variant?: 'card' | 'large'
  className?: string
}) {
  const { isFavourite } = useFavourites()
  const saved = isFavourite(itemKey)

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavourite(itemKey)
  }

  const label = saved ? `Remove ${title} from My Favourites` : `Save ${title} to My Favourites`

  if (variant === 'large') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={label}
        className={`flex min-h-[44px] items-center gap-2 border px-4 font-mono text-[11px] font-bold tracking-[0.25em] transition-colors ${
          saved
            ? 'border-destructive bg-destructive text-destructive-foreground'
            : 'border-border bg-background/60 text-foreground hover:border-destructive hover:text-destructive'
        } ${className}`}
        style={{ transform: 'skewX(-8deg)' }}
      >
        <motion.span key={String(saved)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="inline-flex">
          <Heart className="size-4" fill={saved ? 'currentColor' : 'none'} aria-hidden />
        </motion.span>
        {saved ? 'SAVED' : 'SAVE'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? 'Saved to My Favourites' : 'Save to My Favourites'}
      className={`flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
        saved ? 'bg-destructive text-destructive-foreground' : 'bg-black/55 text-white hover:bg-black/75'
      } ${className}`}
    >
      <motion.span
        key={String(saved)}
        initial={{ scale: saved ? 0.4 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 14 }}
        className="inline-flex"
      >
        <Heart className="size-[18px]" fill={saved ? 'currentColor' : 'none'} aria-hidden />
      </motion.span>
    </button>
  )
}
