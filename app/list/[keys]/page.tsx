import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SharedList } from '@/components/shared-list'
import { getRates } from '@/lib/fx'
import { findListItems } from '@/lib/list-lookup'
import { listPath } from '@/lib/share-list'
import { SITE_NAME, SITE_URL } from '@/lib/site'

// A shared favourites list (/list/<key>-<key>-…). Built on first visit,
// cached at the edge and refreshed every 5 minutes, like item pages.
export const revalidate = 300
export const dynamicParams = true
export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ keys: string }> }

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { keys: param } = await params
  const { keys, items } = await findListItems(param)
  if (!keys.length) return { title: `List not found · ${SITE_NAME}`, robots: { index: false } }

  const n = items.length
  const title = `${n} ${n === 1 ? 'find' : 'finds'} shared on ${SITE_NAME}`
  const names = items.slice(0, 3).map((i) => clip(i.title, 40))
  const description = n
    ? `${names.join(' · ')}${n > 3 ? ` + ${n - 3} more` : ''}. Save them to your favourites in one tap.`
    : 'A favourites list from Fashion Sea.'
  const path = listPath(keys)

  return {
    title,
    description,
    // Personal lists: shareable, but not for search results.
    robots: { index: false, follow: true },
    alternates: { canonical: path },
    openGraph: { type: 'website', url: path, siteName: SITE_NAME, title, description },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ListPage({ params }: Props) {
  const { keys: param } = await params
  const [{ keys, items, missing }, rates] = await Promise.all([findListItems(param), getRates()])
  if (!keys.length) notFound()
  return <SharedList items={items} missing={missing} shareUrl={`${SITE_URL}${listPath(keys)}`} rates={rates} />
}
