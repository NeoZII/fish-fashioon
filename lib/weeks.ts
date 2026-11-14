/**
 * Weekly drops: ISO weeks (Monday–Sunday) in Brussels time.
 * A week id looks like "2026-w46".
 */

const TZ = 'Europe/Brussels'
const DAY = 86400000

/** Brussels calendar day of a moment, "YYYY-MM-DD". */
export function brusselsDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

function dayToUtcNoon(day: string): number {
  const [y, m, d] = day.split('-').map(Number)
  return Date.UTC(y, m - 1, d, 12)
}

function utcNoonToDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export type Week = {
  id: string
  year: number
  week: number
  /** Monday and Sunday, "YYYY-MM-DD" (Brussels calendar days). */
  start: string
  end: string
  /** The 7 days, Monday first. */
  days: string[]
}

function build(year: number, week: number): Week {
  // ISO week 1 is the week with January 4th in it.
  const jan4 = Date.UTC(year, 0, 4, 12)
  const jan4Dow = (new Date(jan4).getUTCDay() + 6) % 7 // Monday = 0
  const monday = jan4 - jan4Dow * DAY + (week - 1) * 7 * DAY
  const days = Array.from({ length: 7 }, (_, i) => utcNoonToDay(monday + i * DAY))
  return { id: `${year}-w${String(week).padStart(2, '0')}`, year, week, start: days[0], end: days[6], days }
}

/** The ISO week a Brussels calendar day belongs to. */
export function weekOfDay(day: string): Week {
  const noon = dayToUtcNoon(day)
  const dow = (new Date(noon).getUTCDay() + 6) % 7
  const thursday = noon + (3 - dow) * DAY // the ISO year is the year of that week's Thursday
  const year = new Date(thursday).getUTCFullYear()
  const jan1 = Date.UTC(year, 0, 1, 12)
  const week = 1 + Math.floor((thursday - jan1) / DAY / 7)
  return build(year, week)
}

export function currentWeek(now: Date = new Date()): Week {
  return weekOfDay(brusselsDay(now))
}

/** Parse "2026-w46" (case-insensitive). Null if malformed or the week doesn't exist. */
export function parseWeekId(id: string): Week | null {
  const m = /^(\d{4})-w(\d{1,2})$/i.exec(id.trim())
  if (!m) return null
  const year = Number(m[1])
  const week = Number(m[2])
  if (week < 1 || week > 53 || year < 2020 || year > 2100) return null
  const w = build(year, week)
  // Week 53 only exists in some years.
  return weekOfDay(w.start).id === w.id ? w : null
}

export function shiftWeek(w: Week, by: number): Week {
  return weekOfDay(utcNoonToDay(dayToUtcNoon(w.start) + by * 7 * DAY))
}

/** True if an item's date_added falls in the week (Brussels days). */
export function addedInWeek(dateAdded: string, w: Week): boolean {
  const ts = new Date(dateAdded).getTime()
  if (Number.isNaN(ts)) return false
  const day = brusselsDay(new Date(ts))
  return day >= w.start && day <= w.end
}
