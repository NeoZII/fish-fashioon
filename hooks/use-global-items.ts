'use client'

import { useEffect, useState } from 'react'
import { type Product } from '@/lib/data'
import { cleanCatalogue } from '@/lib/clean-catalogue'
import { CATALOGUE_ENDPOINT } from '@/lib/catalogue-endpoint'

/** Abort a single attempt after this long so loading can never hang. */
const ATTEMPT_TIMEOUT_MS = 15000
/** Waits between attempts when the endpoint is slow or temporarily empty. */
const RETRY_DELAYS_MS = [1500, 4000, 8000]

/** Keys written by older versions of the site (up to ~1.5 MB each). */
const LEGACY_CACHE_KEYS = ['fishfashion:catalogue:v1', 'fishfashion:catalogue:v2']

function clearLegacyCache() {
  try {
    for (const key of LEGACY_CACHE_KEYS) window.localStorage.removeItem(key)
  } catch {
    // Storage can be unavailable (private mode, blocked cookies): nothing to do.
  }
}

async function fetchOnce(signal: AbortSignal): Promise<Product[]> {
  // Same URL and credentials mode as the <link rel="preload"> emitted by the
  // page, so the browser hands this call the already-downloading response.
  const res = await fetch(CATALOGUE_ENDPOINT, { signal, credentials: 'same-origin' })
  if (!res.ok) throw new Error(`Catalogue responded ${res.status}`)
  return cleanCatalogue(await res.json())
}

/**
 * Loads the catalogue on the client.
 *
 * The page HTML no longer carries the catalogue; it arrives from the
 * edge-cached /api/catalogue (preloaded by the page) while the menu animates.
 * Grids show their loading screen only if someone opens one before it lands.
 * Repeat visits are served from the browser's HTTP cache, so the old 1.5 MB
 * localStorage copy is no longer needed and is cleared.
 */
export function useGlobalItems() {
  const [globalItems, setGlobalItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    clearLegacyCache()

    let active = true
    let controller: AbortController | null = null
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    async function load(attempt: number) {
      controller = new AbortController()
      const timeout = setTimeout(() => controller?.abort(), ATTEMPT_TIMEOUT_MS)
      try {
        const items = await fetchOnce(controller.signal)
        if (!items.length) throw new Error('Catalogue was empty')
        if (active) {
          setGlobalItems(items)
          setLoading(false)
        }
      } catch (err) {
        if (!active) return
        const delay = RETRY_DELAYS_MS[attempt]
        if (delay === undefined) {
          console.warn('Catalogue failed to load after retries:', err)
          setLoading(false) // grids fall back to their normal empty state
          return
        }
        retryTimer = setTimeout(() => load(attempt + 1), delay)
      } finally {
        clearTimeout(timeout)
      }
    }

    load(0)
    return () => {
      active = false
      clearTimeout(retryTimer)
      controller?.abort()
    }
  }, [])

  return { globalItems, loading }
}
