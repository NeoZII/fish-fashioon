import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { ItemView } from '@/components/item-view'
import { itemPath, itemSlug } from '@/lib/item-key'
import { findItemBySlug } from '@/lib/item-lookup'
import { parsePrice } from '@/lib/price'
import { similarItems } from '@/lib/similar'
import { SITE_NAME, SITE_URL } from '@/lib/site'

// Item pages are generated on first visit, cached at the edge and refreshed
// every 5 minutes (same rhythm as the sheet).
export const revalidate = 300
export const dynamicParams = true
export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { item } = await findItemBySlug(slug)
  if (!item) return { title: `Item not found · ${SITE_NAME}`, robots: { index: false } }

  const price = parsePrice(item.price)
  const priceText = [price.usd, price.cny].filter(Boolean).join(' / ')
  const kind = [item.brand, item.category].filter(Boolean).join(' · ')
  const title = `${item.title} · ${SITE_NAME}`
  const description = [priceText, kind, 'Buy it with Kakobuy, find more on Fashion Sea.'].filter(Boolean).join(' · ')
  const path = itemPath(item)

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', url: path, siteName: SITE_NAME, title: item.title, description },
    twitter: { card: 'summary_large_image', title: item.title, description },
  }
}

export default async function ItemPage({ params }: Props) {
  const { slug } = await params
  const { items, item } = await findItemBySlug(slug)
  if (!item) notFound()

  // Same item, old/edited slug text: send to the canonical URL.
  if (decodeURIComponent(slug) !== itemSlug(item)) permanentRedirect(itemPath(item))

  return (
    <ItemView item={item} similar={similarItems(items, item)} shareUrl={`${SITE_URL}${itemPath(item)}`} />
  )
}
