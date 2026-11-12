import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { findItemBySlug } from '@/lib/item-lookup'
import { loadOgPhoto } from '@/lib/og-photo'
import { parsePrice } from '@/lib/price'

// Share-preview card for one item (WhatsApp, Discord, iMessage, Telegram, X,
// Reddit, Facebook, Instagram DMs… all read the og:image tag).
export const size = { width: 1200, height: 630 }
// JPEG keeps cards ~60–120 KB; WhatsApp drops previews much over ~300 KB,
// and a photo-heavy PNG was ~500 KB.
export const contentType = 'image/jpeg'
export const alt = 'Fashion Sea find'
// Build each card once, then serve it from Vercel's cache (refreshed every
// 10 min). Without this the card was regenerated on every request (3–4 s),
// which can exceed the preview timeout of apps like WhatsApp.
export const dynamic = 'force-static'
export const revalidate = 600

const BG = '#0a0a0c'
const FG = '#f5f5f7'
const MUTED = '#9a9aa6'
const CYAN = '#51c0e3'

const fontDir = join(process.cwd(), 'assets/fonts')

/** The bundled fonts are Latin-only; drop glyphs they can't draw (e.g. CJK). */
function latinOnly(text: string): string {
  return text
    .replace(/[^ -ɏ‐-‧‰-⁞]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 3).trimEnd()}...`
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [{ item }, anton, monoBold, mono] = await Promise.all([
    findItemBySlug(slug),
    readFile(join(fontDir, 'anton-latin-400-normal.woff')),
    readFile(join(fontDir, 'geist-mono-latin-700-normal.woff')),
    readFile(join(fontDir, 'geist-mono-latin-400-normal.woff')),
  ])

  const title = clip(latinOnly(item?.title ?? 'Fashion Sea'), 72) || 'Fashion Sea find'
  const titleSize = title.length <= 24 ? 78 : title.length <= 44 ? 64 : 52
  const brand = latinOnly(item?.brand ?? '')
  const category = latinOnly(item?.category ?? '')
  const price = item ? parsePrice(item.price) : { usd: '', cny: null }
  const usd = /\d/.test(price.usd) ? price.usd : ''
  const photo = item ? await loadOgPhoto(item.image) : null

  const png = new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', background: BG }}>
        {/* photo */}
        <div style={{ width: 470, height: 630, display: 'flex', position: 'relative', background: '#16161a' }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" width={470} height={630} style={{ width: 470, height: 630, objectFit: 'cover' }} />
          ) : (
            <div
              style={{
                display: 'flex',
                width: 470,
                height: 630,
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Anton',
                fontSize: 200,
                color: '#26262c',
              }}
            >
              FS
            </div>
          )}
          {category && (
            <div
              style={{
                position: 'absolute',
                left: 26,
                top: 26,
                display: 'flex',
                background: CYAN,
                color: '#082029',
                fontFamily: 'Mono',
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: 4,
                padding: '6px 14px',
                transform: 'skewX(-8deg)',
              }}
            >
              {category}
            </div>
          )}
        </div>

        <div style={{ width: 10, height: 630, display: 'flex', background: CYAN }} />

        {/* text */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '50px 54px 44px 50px' }}>
          {brand && (
            <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: 22, letterSpacing: 6, color: MUTED }}>
              {brand}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              marginTop: 14,
              fontFamily: 'Anton',
              fontSize: titleSize,
              lineHeight: 1.04,
              color: FG,
              textTransform: 'uppercase',
              transform: 'skewX(-6deg)',
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', width: 120, height: 8, marginTop: 22, background: CYAN }} />

          {(usd || price.cny) && (
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 26 }}>
              {usd && (
                <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 86, lineHeight: 1, color: CYAN }}>{usd}</div>
              )}
              {price.cny && (
                <div
                  style={{
                    display: 'flex',
                    fontFamily: 'Mono',
                    fontSize: 30,
                    color: MUTED,
                    marginLeft: usd ? 22 : 0,
                    marginBottom: 8,
                  }}
                >
                  {price.cny}
                </div>
              )}
            </div>
          )}

          <div style={{ flex: 1, display: 'flex' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 46, color: FG, transform: 'skewX(-8deg)' }}>
              FASHION SEA
            </div>
            <div
              style={{
                display: 'flex',
                background: FG,
                color: BG,
                fontFamily: 'Mono',
                fontWeight: 700,
                fontSize: 21,
                letterSpacing: 4,
                padding: '14px 22px',
                transform: 'skewX(-8deg)',
              }}
            >
              BUY ON KAKOBUY
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Anton', data: anton, weight: 400, style: 'normal' },
        { name: 'Mono', data: monoBold, weight: 700, style: 'normal' },
        { name: 'Mono', data: mono, weight: 400, style: 'normal' },
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
