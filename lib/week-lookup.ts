import { cache } from 'react'
import { getCatalogue } from './catalogue'
import { topItemsCached } from './clicks'
import type { Product } from './data'
import { MIN_TAPS_SERVER } from './trending-rules'
import { addedInWeek, currentWeek, parseWeekId, shiftWeek, type Week } from './weeks'

export type WeekData = {
  week: Week
  /** Items added that week, newest first. */
  items: Product[]
  /** The week's items people tapped BUY on most (best first, up to 8). */
  top: Product[]
  prevId: string
  /** Null for the current week (no future weeks). */
  nextId: string | null
}

/** Everything the weekly page, its share card and the Discord post need. */
export const getWeekData = cache(async (id: string): Promise<WeekData | null> => {
  const week = parseWeekId(id)
  if (!week) return null
  const now = currentWeek()
  if (week.start > now.start) return null

  const catalogue = await getCatalogue()
  if (!catalogue.length) throw new Error('Catalogue temporarily unavailable')

  const items = catalogue
    .filter((p) => addedInWeek(p.date_added, week))
    .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())

  let top: Product[] = []
  try {
    const byKey = new Map(items.map((p) => [p.key, p]))
    const taps = await topItemsCached(week.days, 200)
    top = taps
      .filter((t) => t.n >= MIN_TAPS_SERVER && byKey.has(t.key))
      .slice(0, 8)
      .map((t) => byKey.get(t.key) as Product)
  } catch {
    // click data unavailable: the page still lists the week's drops
  }

  return {
    week,
    items,
    top,
    prevId: shiftWeek(week, -1).id,
    nextId: week.id === now.id ? null : shiftWeek(week, 1).id,
  }
})
