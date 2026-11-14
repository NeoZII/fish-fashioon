import { recordBuy, recordSignup, recordVisit } from '@/lib/clicks'

/**
 * Anonymous counters sent by the site (navigator.sendBeacon):
 *   { t: 'buy', k: <item key> }        BUY tap → Trending
 *   { t: 'visit', s: <source> }        first page of a visit, by source
 *   { t: 'signup', p: <place> }        tap on a Kakobuy sign-up link
 * Always answers 204 so it never slows the visitor down or reveals anything.
 */
const KEY_RE = /^[0-9a-z]{10}$/
const SOURCE_RE = /^[a-z0-9._-]{1,40}$/
const PLACES = new Set(['gate', 'howtobuy', 'promo', 'guide'])
const BOTS = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|discord|slack|curl|wget|python|headless/i

const noContent = () => new Response(null, { status: 204 })

export async function POST(req: Request) {
  const ua = req.headers.get('user-agent') ?? ''
  if (!ua || BOTS.test(ua)) return noContent()
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'

  let body: Record<string, unknown>
  try {
    body = JSON.parse(await req.text())
  } catch {
    return noContent()
  }

  try {
    if (body.t === 'buy' && typeof body.k === 'string' && KEY_RE.test(body.k)) {
      await recordBuy(body.k, ip, ua)
    } else if (body.t === 'visit' && typeof body.s === 'string') {
      const source = body.s.toLowerCase()
      await recordVisit(SOURCE_RE.test(source) ? source : 'other')
    } else if (body.t === 'signup' && typeof body.p === 'string' && PLACES.has(body.p)) {
      await recordSignup(body.p, ip, ua)
    }
  } catch (err) {
    console.log('[track] failed:', err)
  }
  return noContent()
}
