import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { preload } from 'react-dom'
import { Experience } from '@/components/experience'
import type { ViewId } from '@/lib/data'
import { CATALOGUE_ENDPOINT } from '@/lib/catalogue-endpoint'
import { PRIVATE_PATHS, SECTION_META, SECTION_SLUGS, VIEW_PATHS, viewFromPath } from '@/lib/sections'
import { SITE_NAME } from '@/lib/site'

// One static page per section (/latest, /all, /sellers, /how-to-buy, /socials,
// /burberry) so each can be shared and bookmarked; anything else is a 404.
export const dynamicParams = false
export function generateStaticParams() {
  return SECTION_SLUGS.map((section) => ({ section }))
}

type Props = { params: Promise<{ section: string }> }

function sectionView(section: string): Exclude<ViewId, 'menu'> | null {
  const view = viewFromPath(`/${section}`)
  return view && view !== 'menu' ? view : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params
  const view = sectionView(section)
  if (!view) return {}
  const meta = SECTION_META[view]
  const title = `${meta.title} · ${SITE_NAME}`
  return {
    title,
    description: meta.description,
    alternates: { canonical: VIEW_PATHS[view] },
    ...(PRIVATE_PATHS.has(VIEW_PATHS[view]) ? { robots: { index: false, follow: true } } : {}),
    // Child metadata replaces the parent's openGraph object, so restate the
    // site-wide preview image here.
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url: VIEW_PATHS[view],
      title,
      description: meta.description,
      images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: meta.description,
      images: ['/opengraph-image.png'],
    },
  }
}

export default async function SectionPage({ params }: Props) {
  const { section } = await params
  const view = sectionView(section)
  if (!view) notFound()
  preload(CATALOGUE_ENDPOINT, { as: 'fetch', crossOrigin: 'anonymous' })
  return <Experience initialView={view} />
}
