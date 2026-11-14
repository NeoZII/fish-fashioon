import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { findListItems } from '@/lib/list-lookup'
import { loadOgPhoto } from '@/lib/og-photo'

// Share-preview card for a shared favourites list: up to four photos and the
// number of finds. Same format and caching as the item cards.
export const size = { width: 1200, height: 630 }
export const contentType = 'image/jpeg'
export const alt = 'Fashion Sea favourites list'
export const dynamic = 'force-static'
export const revalidate = 600

const BG = '#0a0a0c'
const TILE = '#16161a'
const FG = '#f5f5f7'
const MUTED = '#9a9aa6'
const PINK = '#ff60b2'

const fontDir = join(process.cwd(), 'assets/fonts')

export default async function Image({ params }: { params: Promise<{ keys: string }> }) {
  const { keys } = await params
  const [{ items }, anton, monoBold] = await Promise.all([
    findListItems(keys),
    readFile(join(fontDir, 'anton-latin-400-normal.woff')),
    readFile(join(fontDir, 'geist-mono-latin-700-normal.woff')),
  ])

  const photos = await Promise.all(items.slice(0, 4).map((i) => loadOgPhoto(i.image)))
  const n = items.length
  const tiles = [0, 1, 2, 3]

  const png = new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', background: BG }}>
        {/* 2×2 photo grid */}
        <div style={{ width: 630, height: 630, display: 'flex', flexWrap: 'wrap' }}>
          {tiles.map((i) => (
            <div
              key={i}
              style={{
                width: 315,
                height: 315,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: TILE,
                borderRight: i % 2 === 0 ? `3px solid ${BG}` : 'none',
                borderBottom: i < 2 ? `3px solid ${BG}` : 'none',
              }}
            >
              {photos[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[i] as string} alt="" width={315} height={315} style={{ width: 315, height: 315, objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 90, color: '#26262c' }}>FS</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ width: 10, height: 630, display: 'flex', background: PINK }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '56px 50px 46px 50px' }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              background: PINK,
              color: '#2a0716',
              fontFamily: 'Mono',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 5,
              padding: '8px 16px',
              transform: 'skewX(-8deg)',
            }}
          >
            SHARED LIST
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
              color: PINK,
              transform: 'skewX(-6deg)',
            }}
          >
            {n === 1 ? 'FIND' : 'FINDS'}
          </div>
          <div style={{ display: 'flex', marginTop: 22, fontFamily: 'Mono', fontSize: 22, color: MUTED, letterSpacing: 2 }}>
            Save them all in one tap
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
