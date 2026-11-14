import { redirect } from 'next/navigation'
import { currentWeek } from '@/lib/weeks'

// /week always opens the current week's drops.
export const dynamic = 'force-dynamic'

export default function WeekIndex() {
  redirect(`/week/${currentWeek().id}`)
}
