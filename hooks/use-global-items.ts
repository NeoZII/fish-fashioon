'use client'

import { useEffect, useState } from 'react'
import { type Product } from '@/lib/data'

/**
 * Server-side cached proxy for the Google Apps Script catalogue. The raw sheet
 * returns rows matching columns A id, B title, C link, D image, E category,
 * F brand, G price, H seller, I date_added. See app/api/catalogue/route.ts.
 */
const CATALOGUE_ENDPOINT = '/api/catalogue'

/** localStorage key holding the last successfully fetched catalogue. */
const CACHE_KEY = 'fishfashion:catalogue:v1'

function normalize(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((row, i) => {
      const r = row as Record<string, unknown>
      return {
        id: String(r.id ?? i),
        title: String(r.title ?? ''),
        link: String(r.link ?? '#'),
        image: String(r.image ?? ''),
        category: String(r.category ?? '').toUpperCase(),
        brand: String(r.brand ?? ''),
        price: String(r.price ?? ''),
        seller: String(r.seller ?? ''),
        date_added: String(r.date_added ?? ''),
      }
    })
    .filter((p) => p.title)
}

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
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(items))
  } catch {
    // Ignore quota / serialization errors — caching is best-effort.
  }
}

export function useGlobalItems() {
  // Stale-while-revalidate: seed synchronously from the browser cache so repeat
  // visitors see the catalogue immediately with no loading screen, then we
  // refresh in the background. First-time visitors start empty and show the
  // loader only until the (server-cached) fetch resolves.
  const [globalItems, setGlobalItems] = useState<Product[]>(() => readCache() ?? [])
  const [loading, setLoading] = useState(() => readCache() === null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    async function load() {
      try {
        const res = await fetch(CATALOGUE_ENDPOINT, { signal: controller.signal })
        if (!res.ok) throw new Error(`Catalogue responded ${res.status}`)
        const data = normalize(await res.json())
        if (!active) return
        if (data.length) {
          setGlobalItems(data)
          writeCache(data)
        }
        // If the fresh fetch is empty but we already have cached items on
        // screen, keep showing the cached ones rather than blanking the site.
      } catch (err) {
        // On failure, keep any cached items already displayed; otherwise the
        // grids fall back to their normal empty state.
        console.log('[v0] Catalogue fetch failed:', err)
      } finally {
        clearTimeout(timeout)
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
      clearTimeout(timeout)
      controller.abort()
    }
  }, [])

  return { globalItems, loading }
}
