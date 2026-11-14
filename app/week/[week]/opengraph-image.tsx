import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { getWeekData } from '@/lib/week-lookup'
import { loadOgPhoto } from '@/lib/og-photo'

// Share-preview card for a weekly drops page (also the image of the Sunday
// Discord post): up to four photos, the week number and how many finds.
export const size = { width: 1200, height: 630 }
export const contentType = 'image/jpeg'
export const alt = 'Fashion Sea weekly drops'
export const dynamic = 'force-static'
export const revalidate = 600

const BG = '#0a0a0c'
const TILE = '#16161a'
const FG = '#f5f5f7'
const MUTED = '#9a9aa6'
const CYAN = '#51c0e3'

const fontDir = join(process.cwd(), 'assets/fonts')

export default async function Image({ params }: { params: Promise<{ week: string }> }) {
  const { week: id } = await params
  const [data, anton, monoBold] = await Promise.all([
    getWeekData(id),
    readFile(join(fontDir, 'anton-latin-400-normal.woff')),
    readFile(join(fontDir, 'geist-mono-latin-700-normal.woff')),
  ])

  // Up to 4 photos, from the first 8 items (some image hosts refuse servers).
  const items = data ? [...data.top, ...data.items.filter((p) => !data.top.includes(p))] : []
  const loaded = await Promise.all(items.slice(0, 8).map((i) => loadOgPhoto(i.image)))
  const photos = loaded.filter((p): p is string => Boolean(p)).slice(0, 4)
  const n = data?.items.length ?? 0
  const weekNo = data?.week.week ?? 0

  const photo = (src: string, w: number, h: number) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={w} height={h} style={{ width: w, height: h, objectFit: 'cover' }} />
  )
  const GAP = 3
  const half = (630 - GAP) / 2
  // 0 photos: logo tile · 1: full square · 2: two columns · 3: one big + two small · 4: 2×2
  let collage
  if (photos.length === 0) {
    collage = (
      <div style={{ width: 630, height: 630, display: 'flex', alignItems: 'center', justifyContent: 'center', background: TILE }}>
        <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 200, color: '#26262c' }}>FS</div>
      </div>
    )
  } else if (photos.length === 1) {
    collage = <div style={{ width: 630, height: 630, display: 'flex' }}>{photo(photos[0], 630, 630)}</div>
  } else if (photos.length === 2) {
    collage = (
      <div style={{ width: 630, height: 630, display: 'flex', justifyContent: 'space-between' }}>
        {photo(photos[0], half, 630)}
        {photo(photos[1], half, 630)}
      </div>
    )
  } else {
    const right = photos.length === 3 ? [photos[1], photos[2]] : null
    collage =
      right ? (
        <div style={{ width: 630, height: 630, display: 'flex', justifyContent: 'space-between' }}>
          {photo(photos[0], half, 630)}
          <div style={{ width: half, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {photo(right[0], half, half)}
            {photo(right[1], half, half)}
          </div>
        </div>
      ) : (
        <div style={{ width: 630, height: 630, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignContent: 'space-between' }}>
          {photos.map((src, i) => (
            <div key={i} style={{ display: 'flex' }}>
              {photo(src, half, half)}
            </div>
          ))}
        </div>
      )
  }

  const png = new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', background: BG }}>
        {collage}

        <div style={{ width: 10, height: 630, display: 'flex', background: CYAN }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '56px 50px 46px 50px' }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              background: CYAN,
              color: '#082029',
              fontFamily: 'Mono',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 5,
              padding: '8px 16px',
              transform: 'skewX(-8deg)',
            }}
          >
            {`WEEK ${weekNo}`}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 34,
              fontFamily: 'Anton',
              fontSize: n >= 100 ? 150 : 170,
              lineHeight: 0.95,
              color: FG,
              transform: 'skewX(-6deg)',
            }}
          >
            {String(n)}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Anton',
              fontSize: 64,
              lineHeight: 1,
              color: CYAN,
              transform: 'skewX(-6deg)',
            }}
          >
            {n === 1 ? 'NEW FIND' : 'NEW FINDS'}
          </div>
          <div style={{ display: 'flex', marginTop: 22, fontFamily: 'Mono', fontSize: 22, color: MUTED, letterSpacing: 2 }}>
            Direct Kakobuy links
          </div>
          <div style={{ flex: 1, display: 'flex' }} />
          <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 50, color: FG, transform: 'skewX(-8deg)' }}>
            FASHION SEA
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Anton', data: anton, weight: 400, style: 'normal' },
        { name: 'Mono', data: monoBold, weight: 700, style: 'normal' },
      ],
    },
  )

  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()

  return new Response(new Uint8Array(jpeg), {
    headers: { 'Content-Type': 'image/jpeg' },
  })
}
