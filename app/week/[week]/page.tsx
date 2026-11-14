import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { WeeklyDrops } from '@/components/weekly-drops'
import { getRates } from '@/lib/fx'
import { getWeekData } from '@/lib/week-lookup'
import { SITE_NAME } from '@/lib/site'

// One page per week (/week/2026-w46): built on first visit, refreshed every
// 5 minutes like the rest of the catalogue.
export const revalidate = 300
export const dynamicParams = true
export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ week: string }> }

function shortDate(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { week: id } = await params
  const data = await getWeekData(id)
  if (!data) return { title: `Week not found · ${SITE_NAME}`, robots: { index: false } }
  const { week, items } = data
  const title = `Week ${week.week} drops: ${items.length} new ${items.length === 1 ? 'find' : 'finds'} · ${SITE_NAME}`
  const description = `Every find added to Fashion Sea from ${shortDate(week.start)} to ${shortDate(week.end)} ${week.year}, with direct Kakobuy links.`
  const path = `/week/${week.id}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', url: path, siteName: SITE_NAME, title, description },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function WeekPage({ params }: Props) {
  const { week: id } = await params
  const [data, rates] = await Promise.all([getWeekData(id), getRates()])
  if (!data) notFound()
  // Same week, other spelling (e.g. 2026-W46): send to the canonical URL.
  if (decodeURIComponent(id) !== data.week.id) permanentRedirect(`/week/${data.week.id}`)
  return <WeeklyDrops data={data} rates={rates} />
}
