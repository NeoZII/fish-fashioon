'use client'

import { useEffect, useState } from 'react'
import { type Product } from '@/lib/data'

/**
 * Live Google Apps Script deployment feeding the catalogue.
 * The script returns a JSON array of rows matching the sheet columns:
 * A id, B title, C link, D image, E category, F brand, G price, H seller,
 * I date_added.
 */
const SHEET_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwbaFyh3AHeysqlwzrk2tDMbBbKjX7onnbc0uLoN1dItZhjqiehYgMuxLotDzjQQwBo/exec'

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

// Give up on the (occasionally very slow) Apps Script endpoint after this long
// so the loading screen can never hang indefinitely.
const FETCH_TIMEOUT_MS = 15000

export function useGlobalItems() {
  // Start empty so nothing renders until the real data has arrived. If the
  // fetch fails or returns nothing, we stay empty — no placeholder catalogue.
  const [globalItems, setGlobalItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    async function load() {
      try {
        const res = await fetch(SHEET_ENDPOINT, {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`Sheet responded ${res.status}`)
        const data = normalize(await res.json())
        if (active) setGlobalItems(data)
      } catch (err) {
        // On any failure (network error, bad response, or timeout) render
        // nothing — the grids show their normal empty state.
        console.log('[v0] Sheet fetch failed, rendering empty catalogue:', err)
        if (active) setGlobalItems([])
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
