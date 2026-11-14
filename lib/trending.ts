'use client'

import { useSyncExternalStore } from 'react'
import { MIN_TAPS_SERVER } from './trending-rules'

/**
 * Trending ranks, fetched once per page load from /api/trending (edge-cached
 * 10 min) and shared by every card. Ranks only count once enough people have
 * tapped BUY, so a single click can't make something "trending".
 */
export type TrendingState = {
  loaded: boolean
  enabled: boolean
  /** Best first. */
  items: { key: string; n: number }[]
  /** key → rank (1-based), only for items that qualify. */
  rank: Map<string, number>
}

/** An item needs at least this many different people tapping BUY this week. */
export const MIN_TAPS = MIN_TAPS_SERVER
/** Cards show the flame badge for the top N. */
export const BADGE_TOP = 10

const EMPTY: TrendingState = { loaded: false, enabled: false, items: [], rank: new Map() }
let state: TrendingState = EMPTY
let started = false
const listeners = new Set<() => void>()

function load() {
  if (started) return
  started = true
  fetch('/api/trending')
    .then((r) => (r.ok ? r.json() : { enabled: false, items: [] }))
    .then((data: { enabled?: boolean; items?: { key: string; n: number }[] }) => {
      const items = (data.items ?? []).filter((i) => i && typeof i.key === 'string' && i.n >= MIN_TAPS)
      state = { loaded: true, enabled: Boolean(data.enabled), items, rank: new Map(items.map((i, idx) => [i.key, idx + 1])) }
    })
    .catch(() => {
      state = { ...EMPTY, loaded: true }
    })
    .finally(() => listeners.forEach((l) => l()))
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  load()
  return () => listeners.delete(cb)
}

export function useTrending(): TrendingState {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY)
}
