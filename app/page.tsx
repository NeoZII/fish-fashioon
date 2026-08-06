import { Experience } from '@/components/experience'
import { getCatalogue } from '@/lib/catalogue'

// Render on every request instead of statically pre-rendering. This is the key
// fix for the "0 products even after refreshing" bug: with ISR (`revalidate`),
// a single empty/slow upstream response at generation time would get pinned as
// static HTML and served to everyone for the whole window. Rendering per
// request means an empty result is never cached — the next load simply retries.
//
// This stays fast because getCatalogue() reads through the Next.js fetch Data
// Cache (revalidate 300), so the slow Apps Script origin is hit at most once
// every 5 minutes; warm renders complete in tens of milliseconds.
export const dynamic = 'force-dynamic'

export default async function Page() {
  const initialItems = await getCatalogue()
  return <Experience initialItems={initialItems} />
}
