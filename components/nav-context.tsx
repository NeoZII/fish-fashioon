'use client'

import { createContext, useContext } from 'react'
import type { ViewId } from '@/lib/data'

/** In-app navigation (with the curtain transition), provided by <Experience>. */
export const NavContext = createContext<((view: ViewId) => void) | null>(null)

export function useAppNavigate() {
  return useContext(NavContext)
}
