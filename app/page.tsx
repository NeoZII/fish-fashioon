import { Experience } from '@/components/experience'
import { getCatalogue } from '@/lib/catalogue'

// Regenerate the pre-rendered page (with the catalogue baked in) at most every
// 5 minutes. Visitors get static HTML that already contains the products, so
// they never land on an empty or loading grid.
export const revalidate = 300

export default async function Page() {
  const initialItems = await getCatalogue()
  return <Experience initialItems={initialItems} />
}
