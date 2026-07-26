'use client'

import { useEffect, useState } from 'react'
import { FALLBACK_ITEMS, type Product } from '@/lib/data'

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
        image: String(r.image ?? '/placeholder.svg'),
        category: String(r.category ?? '').toUpperCase(),
        brand: String(r.brand ?? ''),
        price: String(r.price ?? ''),
        seller: String(r.seller ?? ''),
        date_added: String(r.date_added ?? ''),
      }
    })
    .filter((p) => p.title)
}

export function useGlobalItems() {
  const [globalItems, setGlobalItems] = useState<Product[]>(FALLBACK_ITEMS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const res = await fetch(SHEET_ENDPOINT, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Sheet responded ${res.status}`)
        const data = normalize(await res.json())
        if (active && data.length) setGlobalItems(data)
      } catch (err) {
        console.log('[v0] Sheet fetch failed, using fallback catalogue:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return { globalItems, loading }
}
