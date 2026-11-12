'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

/**
 * "My Favourites": saved in the visitor's browser (localStorage), no account.
 * Items are stored by their stable key (lib/item-key.ts), so favourites
 * survive sheet re-sorting and row deletions.
 */

type Entry = { k: string; t: number }

const STORAGE_KEY = 'fs:favourites'
const CHANGE_EVENT = 'fs:favourites-change'
const MAX_FAVOURITES = 500
const EMPTY: Entry[] = []

let cache: Entry[] | null = null

function read(): Entry[] {
  if (cache) return cache
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    cache = Array.isArray(parsed)
      ? parsed.filter((e): e is Entry => e && typeof e.k === 'string' && typeof e.t === 'number')
      : []
  } catch {
    cache = []
  }
  return cache
}

function write(list: Entry[]) {
  cache = list
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Storage full or blocked: keep the in-memory list for this visit.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null // another tab changed it
      onChange()
    }
  }
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function toggleFavourite(key: string): boolean {
  const list = read()
  if (list.some((e) => e.k === key)) {
    write(list.filter((e) => e.k !== key))
    return false
  }
  write([{ k: key, t: Date.now() }, ...list].slice(0, MAX_FAVOURITES))
  return true
}

export function removeFavourites(keys: string[]) {
  const drop = new Set(keys)
  write(read().filter((e) => !drop.has(e.k)))
}

export function clearFavourites() {
  write([])
}

/** Live list of favourites (newest first) + helpers; empty during server render. */
export function useFavourites() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY)
  const keys = useMemo(() => new Set(list.map((e) => e.k)), [list])
  const isFavourite = useCallback((key: string) => keys.has(key), [keys])
  return { list, keys, count: list.length, isFavourite }
}

const INTRO_KEY = 'fs:favourites-intro-seen'

export function hasSeenFavouritesIntro(): boolean {
  try {
    return window.localStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}

export function markFavouritesIntroSeen() {
  try {
    window.localStorage.setItem(INTRO_KEY, '1')
  } catch {
    // ignore
  }
}
