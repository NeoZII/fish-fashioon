'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/data'
import { itemPath } from '@/lib/item-key'
import { parsePrice } from '@/lib/price'
import { ProductImage } from '@/components/product-image'
import { ShareButton } from '@/components/share-button'
import { isLandingPage } from '@/components/landing-tracker'
import { FavouriteButton } from '@/components/favourite-button'
import { FavouritesLink } from '@/components/favourites-link'

export function ItemView({
  item,
  similar,
  shareUrl,
}: {
  item: Product
  similar: Product[]
  shareUrl: string
}) {
  const router = useRouter()
  const price = parsePrice(item.price)

  // Back to where the visitor came from on our site; people arriving from a
  // shared link (WhatsApp, Discord…) go to All Items instead of leaving.
  const goBack = () => {
    if (isLandingPage()) router.push('/all')
    else router.back()
  }

  const shareText = `${item.title}${price.usd ? ` · ${price.usd}` : ''} on Fashion Sea`

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background">
      <div className="p3-stripes pointer-events-none absolute inset-0 opacity-40" />

      <div className="sticky top-0 z-30 border-b border-border bg-background/95">
        <header className="flex items-center justify-between gap-4 px-4 py-3 md:px-10">
          <button
            type="button"
            onClick={goBack}
            className="group flex min-h-[44px] items-center gap-2 font-mono text-xs tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            BACK
          </button>
          <div className="flex items-center gap-3">
            <FavouritesLink />
            <Link
              href="/"
              className="font-display text-xl italic tracking-wide text-foreground/80 transition-colors hover:text-foreground"
            >
              FashionSea
            </Link>
          </div>
        </header>
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-32 pt-6 md:px-10 md:pb-24 md:pt-10">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* photo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-card"
          >
            <ProductImage
              src={item.image}
              size={800}
              alt={item.title}
              loading="eager"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {item.category && (
              <span className="absolute left-3 top-3 skew-x-[-8deg] bg-primary px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-primary-foreground">
                {item.category}
              </span>
            )}
          </motion.div>

          {/* details */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            {item.brand && (
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.brand}</span>
            )}
            <h1 className="mt-2 font-display text-4xl italic leading-[0.95] tracking-wide text-foreground text-balance md:text-6xl">
              {item.title}
            </h1>
            <div className="mt-3 h-1 w-24 bg-primary" />

            {(price.usd || price.cny) && (
              <div className="mt-6 flex items-baseline gap-3">
                {price.usd && (
                  <span className="font-mono text-3xl font-bold tabular-nums text-primary md:text-4xl">{price.usd}</span>
                )}
                {price.cny && (
                  <span className="font-mono text-base tabular-nums text-muted-foreground">{price.cny}</span>
                )}
              </div>
            )}
            {item.seller && (
              <p className="mt-2 font-mono text-xs tracking-[0.2em] text-muted-foreground">SELLER · {item.seller}</p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex min-h-[52px] items-center gap-2 bg-foreground px-7 font-mono text-sm font-bold tracking-[0.25em] text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                style={{ transform: 'skewX(-8deg)' }}
              >
                BUY ON KAKOBUY
                <ArrowUpRight className="size-4" />
              </a>
              <FavouriteButton itemKey={item.key} title={item.title} variant="large" />
              <ShareButton url={shareUrl} title={item.title} text={shareText} previewImage={`${itemPath(item)}/opengraph-image`} />
            </div>

            <p className="mt-6 max-w-md font-mono text-[11px] leading-relaxed tracking-wide text-muted-foreground">
              Price is the seller&apos;s listing converted by Kakobuy. Shipping is paid separately once your
              haul reaches the warehouse.{' '}
              <Link href="/how-to-buy" className="underline underline-offset-4 hover:text-foreground">
                How to buy
              </Link>
            </p>
          </motion.div>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-3xl italic tracking-wide text-foreground md:text-4xl">MORE LIKE THIS</h2>
            <div className="mt-2 h-1 w-16 bg-secondary" />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {similar.map((p) => {
                const pp = parsePrice(p.price)
                return (
                  <Link
                    key={p.key}
                    href={itemPath(p)}
                    className="group flex flex-col overflow-hidden rounded-md border border-border bg-card"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <ProductImage
                        src={p.image}
                        alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        {p.brand}
                      </span>
                      <span className="font-display text-sm italic leading-tight tracking-wide text-foreground line-clamp-2">
                        {p.title}
                      </span>
                      {pp.usd && (
                        <span className="mt-auto pt-2 font-mono text-sm font-semibold tabular-nums text-primary">
                          {pp.usd}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {/* phones: price + BUY always within thumb reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex min-w-0 flex-1 flex-col leading-none">
          {price.usd && (
            <span className="truncate font-mono text-lg font-bold tabular-nums text-primary">{price.usd}</span>
          )}
          {price.cny && (
            <span className="mt-1 truncate font-mono text-[11px] tabular-nums text-muted-foreground">{price.cny}</span>
          )}
        </div>
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex min-h-[48px] shrink-0 items-center gap-2 bg-foreground px-5 font-mono text-xs font-bold tracking-[0.2em] text-background active:bg-primary active:text-primary-foreground"
          style={{ transform: 'skewX(-8deg)' }}
        >
          BUY ON KAKOBUY
          <ArrowUpRight className="size-4" />
        </a>
      </div>
    </div>
  )
}
