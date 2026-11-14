import { createHash } from 'node:crypto'
import { Redis } from '@upstash/redis'

/**
 * Click counts for Trending (and a simple funnel: visits by source, signup
 * taps), kept in Upstash Redis. Server-only.
 *
 * - BUY taps: one sorted set per day, item key → unique tappers that day
 *   (one visitor counts once per item per day, so nobody can pump an item).
 * - Visits: one hash per day, source → count. Signup taps: one hash per day,
 *   place → count.
 * Everything expires after 60 days. No personal data is stored: visitors are
 * only seen as a salted hash for the once-a-day check, which expires in 2 days.
 *
 * If the database isn't connected (no env vars), every function is a no-op
 * and Trending simply stays hidden.
 */

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
export const redis = url && token ? new Redis({ url, token }) : null

const KEEP_SECONDS = 60 * 24 * 60 * 60
const SEEN_SECONDS = 2 * 24 * 60 * 60
const TZ = 'Europe/Brussels'

/** Calendar day in Brussels, e.g. "2026-11-14". */
export function dayKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

/** `n` consecutive calendar days ending on `lastDay` ("YYYY-MM-DD"), newest first. */
export function daysEnding(lastDay: string, n: number): string[] {
  const [y, m, d] = lastDay.split('-').map(Number)
  const noon = Date.UTC(y, m - 1, d, 12) // noon UTC: no daylight-saving edge cases
  return Array.from({ length: n }, (_, i) => new Date(noon - i * 86400000).toISOString().slice(0, 10))
}

/** The last `n` Brussels days including today, newest first. */
export function lastDays(n: number, from: Date = new Date()): string[] {
  return daysEnding(dayKey(from), n)
}

function visitorHash(ip: string, ua: string, extra: string): string {
  const salt = process.env.CLICK_SALT || 'fashion-sea'
  return createHash('sha256').update(`${salt}|${ip}|${ua}|${extra}`).digest('base64url').slice(0, 22)
}

/** Count a BUY tap on an item (once per visitor per item per day). */
export async function recordBuy(itemKey: string, ip: string, ua: string): Promise<boolean> {
  if (!redis) return false
  const day = dayKey()
  const seen = await redis.set(`c:seen:${day}:${visitorHash(ip, ua, itemKey)}`, 1, { nx: true, ex: SEEN_SECONDS })
  if (seen !== 'OK') return false
  const p = redis.pipeline()
  p.zincrby(`c:buy:${day}`, 1, itemKey)
  p.expire(`c:buy:${day}`, KEEP_SECONDS)
  p.hincrby(`c:stat:${day}`, 'buy', 1)
  p.expire(`c:stat:${day}`, KEEP_SECONDS)
  await p.exec()
  return true
}

/** Count a visit (first page of a browsing session) by where it came from. */
export async function recordVisit(source: string): Promise<void> {
  if (!redis) return
  const day = dayKey()
  const p = redis.pipeline()
  p.hincrby(`c:visit:${day}`, source, 1)
  p.expire(`c:visit:${day}`, KEEP_SECONDS)
  await p.exec()
}

/** Count a tap on a Kakobuy sign-up link, by where on the site it was. */
export async function recordSignup(place: string, ip: string, ua: string): Promise<void> {
  if (!redis) return
  const day = dayKey()
  const seen = await redis.set(`c:seen:${day}:${visitorHash(ip, ua, `signup:${place}`)}`, 1, { nx: true, ex: SEEN_SECONDS })
  if (seen !== 'OK') return
  const p = redis.pipeline()
  p.hincrby(`c:signup:${day}`, place, 1)
  p.expire(`c:signup:${day}`, KEEP_SECONDS)
  await p.exec()
}

/** Most-tapped items over the given days: [{ key, n }] best first. */
export async function topItems(days: string[], limit = 60): Promise<{ key: string; n: number }[]> {
  if (!redis || !days.length) return []
  const p = redis.pipeline()
  for (const d of days) p.zrange(`c:buy:${d}`, 0, 299, { rev: true, withScores: true })
  const results = (await p.exec()) as (string | number)[][]
  const total = new Map<string, number>()
  for (const flat of results) {
    if (!Array.isArray(flat)) continue
    for (let i = 0; i + 1 < flat.length; i += 2) {
      const key = String(flat[i])
      total.set(key, (total.get(key) ?? 0) + Number(flat[i + 1]))
    }
  }
  return [...total.entries()]
    .map(([key, n]) => ({ key, n }))
    .sort((a, b) => b.n - a.n || a.key.localeCompare(b.key))
    .slice(0, limit)
}

/**
 * Same as topItems, for pages that are rebuilt every few minutes (the weekly
 * page and its share card). The Redis client always fetches with `no-store`,
 * which Next.js refuses inside such pages ("changed from static to dynamic"),
 * so this asks Upstash's REST pipeline directly with a 5-minute cache.
 */
export async function topItemsCached(days: string[], limit = 60): Promise<{ key: string; n: number }[]> {
  if (!url || !token || !days.length) return []
  const res = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(days.map((d) => ['ZRANGE', `c:buy:${d}`, '0', '299', 'REV', 'WITHSCORES'])),
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`Click data unavailable (${res.status})`)
  const results = (await res.json()) as { result?: unknown; error?: string }[]
  const total = new Map<string, number>()
  for (const r of results) {
    const flat = r?.result
    if (!Array.isArray(flat)) continue
    for (let i = 0; i + 1 < flat.length; i += 2) {
      const key = String(flat[i])
      total.set(key, (total.get(key) ?? 0) + Number(flat[i + 1]))
    }
  }
  return [...total.entries()]
    .map(([key, n]) => ({ key, n }))
    .sort((a, b) => b.n - a.n || a.key.localeCompare(b.key))
    .slice(0, limit)
}

/** Run once per `id` (e.g. the weekly Discord post). False if it already ran. */
export async function claimOnce(id: string, ttlSeconds: number): Promise<boolean> {
  if (!redis) return false
  return (await redis.set(`once:${id}`, Date.now(), { nx: true, ex: ttlSeconds })) === 'OK'
}

/** Undo claimOnce (when the job failed and should be allowed to retry). */
export async function releaseOnce(id: string): Promise<void> {
  if (!redis) return
  await redis.del(`once:${id}`)
}
