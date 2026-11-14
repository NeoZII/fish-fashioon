'use client'

import type { ViewId } from './data'
import type { WhatsNewCard } from './i18n'

/**
 * "What's new" guide. Shown once per RELEASE: returning visitors get the list
 * of changes, first-time visitors get a short tour of how the site works.
 * Bump RELEASE (and the card lists) to show it again after a future update.
 */
export const RELEASE = '2026-11-15'

const SEEN_KEY = 'fs:whats-new'

/** Keys older versions of the site wrote: their presence means "been here before". */
const RETURNING_KEYS = [
  'fishfashion:promo-seen',
  'fs:favourites',
  'fs:favourites-intro-seen',
  'fs:lang',
  'fs:currency',
  'fs:visited',
]

export const CARDS_NEW: WhatsNewCard[] = ['find', 'favs', 'buy', 'codes', 'prefs', 'shareFavs']
export const CARDS_RETURNING: WhatsNewCard[] = [
  'video',
  'shareFavs',
  'codes',
  'favs',
  'prefs',
  'search',
  'items',
  'links',
]

/** Where each card's OPEN button goes (cards without a target only explain). */
export const CARD_TARGET: Partial<Record<WhatsNewCard, Exclude<ViewId, 'menu'>>> = {
  find: 'drops',
  favs: 'favourites',
  shareFavs: 'favourites',
  buy: 'manifesto',
  video: 'manifesto',
  codes: 'manifesto',
  search: 'archive',
  items: 'archive',
}

function get(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function set(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // storage blocked: the guide may show again next visit
  }
}

let returningCache: boolean | null = null

/** Decided once per page load, before this visit writes anything. */
export function isReturningVisitor(): boolean {
  if (returningCache === null) returningCache = RETURNING_KEYS.some((k) => get(k) !== null)
  set('fs:visited', '1')
  return returningCache
}

export function hasSeenRelease(): boolean {
  return get(SEEN_KEY) === RELEASE
}

export function markReleaseSeen() {
  set(SEEN_KEY, RELEASE)
}

/** The promo pop-up announces its close so the guide never stacks on top of it. */
export const PROMO_CLOSED_EVENT = 'fs:promo-closed'
