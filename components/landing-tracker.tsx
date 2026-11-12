'use client'

import { useEffect } from 'react'

export const LANDING_KEY = 'fs:landing'

/**
 * Remembers which page this tab first loaded (a full page load, e.g. from a
 * shared link). Lives in the root layout, which stays mounted across in-site
 * navigation, so it only runs on real page loads.
 */
export function LandingTracker() {
  useEffect(() => {
    try {
      window.sessionStorage.setItem(LANDING_KEY, window.location.pathname)
    } catch {
      // storage unavailable: item pages fall back to "go to All Items"
    }
  }, [])
  return null
}

/** True if the current page is the one this tab landed on (no in-site page to go back to). */
export function isLandingPage(): boolean {
  try {
    const landing = window.sessionStorage.getItem(LANDING_KEY)
    return !landing || landing === window.location.pathname
  } catch {
    return true
  }
}
