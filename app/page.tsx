import { preload } from 'react-dom'
import { Experience } from '@/components/experience'
import { CATALOGUE_ENDPOINT } from '@/lib/catalogue-endpoint'

// The page itself is now a small static shell served from the CDN edge; it no
// longer embeds the ~1.7 MB catalogue. The catalogue streams in from
// /api/catalogue (edge-cached, see app/api/catalogue/route.ts) while the menu
// animation plays, so first paint no longer waits for the data.
//
// Previously this page was rendered per request with the whole catalogue
// inlined, to dodge an "empty catalogue frozen into static HTML" bug. That bug
// can't happen any more: the HTML contains no catalogue, and the API route
// refuses to cache an empty response.
export default function Page() {
  // Start downloading the catalogue in parallel with the JS bundle instead of
  // after hydration. The client fetch in useGlobalItems reuses this request.
  preload(CATALOGUE_ENDPOINT, { as: 'fetch', crossOrigin: 'anonymous' })
  return <Experience />
}
