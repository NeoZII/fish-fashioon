'use client'

import { useEffect, useState } from 'react'
import { type Product } from '@/lib/data'
import { cleanCatalogue } from '@/lib/clean-catalogue'

/**
 * Server-side cached proxy for the Google Apps Script catalogue. The raw sheet
 * returns rows matching columns A id, B title, C link, D image, E category,
 * F brand, G price, H seller, I date_added. See app/api/catalogue/route.ts.
 */
const CATALOGUE_ENDPOINT = '/api/catalogue'

/** localStorage key holding the last successfully fetched catalogue. */
const CACHE_KEY = 'fishfashion:catalogue:v2'

const normalize = cleanCatalogue

// Give up on the request after this long so the loading screen can never hang
// indefinitely on a slow network.
const FETCH_TIMEOUT_MS = 20000

/** Read the previously cached catalogue from localStorage, if any. */
function readCache(): Product[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? (parsed as Product[]) : null
  } catch {
    return null
  }
}

/** Persist the latest catalogue so the next visit can paint instantly. */
function writeCache(items: Product[]) {
  if (typeof window === 'undefined') return
  try {
    // Drop the pre-cleanup copy (~1.5 MB) left by older versions of the site.
    window.localStorage.removeItem('fishfashion:catalogue:v1')
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(items))
  } catch {
    // Ignore quota / serialization errors — caching is best-effort.
  }
}

export function useGlobalItems(initialItems: Product[] = []) {
  // Priority for the first paint (no loading screen if any of these hit):
  //   1. server-rendered `initialItems` baked into the page HTML (fastest,
  //      guarantees products are present on arrival),
  //   2. the browser's localStorage cache from a previous visit,
  //   3. empty — show the loader only until the background fetch resolves.
  // In every case we still refresh in the background below.
  const seed = initialItems.length ? initialItems : readCache() ?? []
  const [globalItems, setGlobalItems] = useState<Product[]>(seed)
  const [loading, setLoading] = useState(seed.length === 0)

  // Persist server data so an immediate reload paints instantly from cache.
  useEffect(() => {
    if (initialItems.length) writeCache(initialItems)
  }, [initialItems])

  useEffect(() => {
    // Normal case: the server already rendered the catalogue into the page (or
    // we restored it from localStorage), so there is nothing to recover and we
    // avoid the slow client round-trip through /api/catalogue entirely.
    if (globalItems.length) {
      setLoading(false)
      return
    }

    // Recovery path only: the server returned nothing AND there was no cached
    // copy. Fetch client-side so the visitor still gets products instead of an
    // empty grid.
    let active = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    async function recover() {
      try {
        const res = await fetch(CATALOGUE_ENDPOINT, { signal: controller.signal })
        if (!res.ok) throw new Error(`Catalogue responded ${res.status}`)
        const data = normalize(await res.json())
        if (active && data.length) {
          setGlobalItems(data)
          writeCache(data)
        }
      } catch (err) {
        // Keep the empty state; the grids show their normal "nothing here" copy.
        console.log('[v0] Catalogue recovery fetch failed:', err)
      } finally {
        clearTimeout(timeout)
        if (active) setLoading(false)
      }
    }

    recover()
    return () => {
      active = false
      clearTimeout(timeout)
      controller.abort()
    }
    // Run once on mount; `globalItems` is only read for its initial value here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { globalItems, loading }
}
