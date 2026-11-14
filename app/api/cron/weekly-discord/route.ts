import { SIGNUP_URL } from '@/lib/buy-gate-url'
import { claimOnce, releaseOnce } from '@/lib/clicks'
import type { Product } from '@/lib/data'
import { itemPath } from '@/lib/item-key'
import { parsePrice } from '@/lib/price'
import { SITE_URL } from '@/lib/site'
import { getWeekData } from '@/lib/week-lookup'
import { currentWeek } from '@/lib/weeks'

/**
 * Sunday Discord post: "Week 46 drops", the most wanted finds, a link to the
 * weekly page and the coupon hook. Called by Vercel Cron (vercel.json) on
 * Sunday evening.
 *
 * Safe to be public: it only posts on Sunday evening (Brussels), only once
 * per week (claimed in the database), and only to the webhook in the
 * DISCORD_WEBHOOK_URL environment variable. ?dry=1 shows the post without
 * sending it.
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const TZ = 'Europe/Brussels'

function brusselsNow(): { weekday: string; hour: number } {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', hour: 'numeric', hourCycle: 'h23' }).formatToParts(new Date())
  return {
    weekday: parts.find((p) => p.type === 'weekday')?.value ?? '',
    hour: Number(parts.find((p) => p.type === 'hour')?.value ?? 0),
  }
}

/** Discord markdown: keep titles from breaking the [title](link) syntax. */
function clean(text: string, max = 70): string {
  const t = text.replace(/[\[\]()*_`~|>]/g, ' ').replace(/\s+/g, ' ').trim()
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`
}

function priceText(p: Product): string {
  const { usd, cny } = parsePrice(p.price)
  return [/\d/.test(usd) ? usd : '', cny ?? ''].filter(Boolean).join(' / ')
}

function buildPost(weekId: string, data: NonNullable<Awaited<ReturnType<typeof getWeekData>>>) {
  const { week, items, top } = data
  const pick = top.length >= 3 ? top.slice(0, 8) : items.slice(0, 8)
  const weekUrl = `${SITE_URL}/week/${weekId}`
  const lines = pick.map((p, i) => {
    const price = priceText(p)
    return `**${i + 1}.** [${clean(p.title)}](${SITE_URL}${itemPath(p)})${price ? ` · ${price}` : ''}`
  })
  const description = [
    top.length >= 3 ? '🔥 **Most wanted this week**' : '🆕 **Fresh this week**',
    ...lines,
    '',
    `👉 **[See all ${items.length} finds of week ${week.week}](${weekUrl})**`,
    '',
    `🎟️ New to Kakobuy? Get **$400+ in coupons**: ${SIGNUP_URL}`,
    'Shipping codes: **Fashionsea** −20% · **seafinds** −$15',
  ].join('\n')

  return {
    username: 'Fashion Sea',
    avatar_url: `${SITE_URL}/icon.png`,
    content: `**Week ${week.week} drops are up: ${items.length} new ${items.length === 1 ? 'find' : 'finds'}** 🔥`,
    allowed_mentions: { parse: [] as string[] },
    embeds: [
      {
        title: `WEEK ${week.week} DROPS · ${items.length} NEW ${items.length === 1 ? 'FIND' : 'FINDS'}`,
        url: weekUrl,
        color: 0x51c0e3,
        description: description.slice(0, 4000),
        image: { url: `${weekUrl}/opengraph-image` },
        footer: { text: 'Fashion Sea · new finds every day' },
      },
    ],
  }
}

export async function GET(req: Request) {
  const dry = new URL(req.url).searchParams.get('dry') === '1'
  const week = currentWeek()
  const data = await getWeekData(week.id)
  if (!data) return Response.json({ ok: false, reason: 'no week data' }, { status: 500 })
  const post = buildPost(week.id, data)
  if (dry) return Response.json({ ok: true, dry: true, week: week.id, post })

  // Previews share the database with production: only the live site may post,
  // so a preview can never use up the week's post or link to itself.
  if (process.env.VERCEL_ENV !== 'production') {
    return Response.json({ ok: false, reason: 'posts only from the production site (use ?dry=1 to preview)' })
  }
  const webhook = process.env.DISCORD_WEBHOOK_URL
  if (!webhook) return Response.json({ ok: false, reason: 'DISCORD_WEBHOOK_URL is not set' })
  const { weekday, hour } = brusselsNow()
  if (weekday !== 'Sun' || hour < 17) return Response.json({ ok: false, reason: 'only on Sunday evening' })
  if (!data.items.length) return Response.json({ ok: false, reason: 'no drops this week' })

  const claimId = `discord-weekly:${week.id}`
  if (!(await claimOnce(claimId, 10 * 24 * 3600))) {
    return Response.json({ ok: false, reason: 'already posted this week (or the database is not connected)' })
  }

  try {
    // Build the share image first so Discord finds it ready.
    await fetch(post.embeds[0].image.url, { signal: AbortSignal.timeout(20000) }).catch(() => {})
    const res = await fetch(`${webhook}?wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`Discord answered ${res.status}: ${(await res.text()).slice(0, 200)}`)
    return Response.json({ ok: true, week: week.id, items: data.items.length })
  } catch (err) {
    await releaseOnce(claimId) // let the next call retry
    console.log('[weekly-discord] failed:', err)
    return Response.json({ ok: false, reason: String(err) }, { status: 502 })
  }
}
