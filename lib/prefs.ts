'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { detectLang, LANGS, MESSAGES, type Lang, type Messages } from './i18n'
import {
  FALLBACK_RATES,
  formatMoney,
  formatYuan,
  parsePriceNumbers,
  type Currency,
  type FxRates,
} from './money'

/**
 * Visitor preferences: interface language and price currency, remembered in
 * this browser (localStorage). First visit picks them from the browser:
 * language from its language list, € for European time zones, $ elsewhere.
 * Also holds the live exchange rates (sent along with the catalogue).
 */

export type Prefs = {
  lang: Lang
  currency: Currency
  rates: FxRates
  /** True once today's rates arrived from the server (otherwise fallbacks). */
  ratesLive: boolean
}

const LANG_KEY = 'fs:lang'
const CURRENCY_KEY = 'fs:currency'
const CHANGE_EVENT = 'fs:prefs-change'

const SERVER_PREFS: Prefs = { lang: 'en', currency: 'USD', rates: FALLBACK_RATES, ratesLive: false }

/** Europe outside the euro-less east, where € reads more naturally than $. */
function defaultCurrency(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    const nonEuro = /^Europe\/(Moscow|Minsk|Kirov|Volgograd|Samara|Ulyanovsk|Astrakhan|Saratov|Simferopol|Istanbul)$/
    return tz.startsWith('Europe/') && !nonEuro.test(tz) ? 'EUR' : 'USD'
  } catch {
    return 'USD'
  }
}

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

let snapshot: Prefs | null = null
let rates: FxRates = FALLBACK_RATES
let ratesLive = false

function compute(): Prefs {
  const storedLang = readStored(LANG_KEY)
  const lang = (LANGS as readonly string[]).includes(storedLang ?? '')
    ? (storedLang as Lang)
    : detectLang(navigator.languages?.length ? navigator.languages : [navigator.language || 'en'])
  const storedCurrency = readStored(CURRENCY_KEY)
  const currency: Currency = storedCurrency === 'USD' || storedCurrency === 'EUR' ? storedCurrency : defaultCurrency()
  return { lang, currency, rates, ratesLive }
}

function getSnapshot(): Prefs {
  if (!snapshot) {
    snapshot = compute()
    document.documentElement.lang = snapshot.lang
  }
  return snapshot
}

function getServerSnapshot(): Prefs {
  return SERVER_PREFS
}

function notify() {
  snapshot = null
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === LANG_KEY || e.key === CURRENCY_KEY) {
      snapshot = null
      callback()
    }
  }
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}

function store(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Storage blocked: the choice still applies for this visit.
  }
}

export function setLang(lang: Lang) {
  store(LANG_KEY, lang)
  notify()
}

export function setCurrency(currency: Currency) {
  store(CURRENCY_KEY, currency)
  notify()
}

/** Apply live exchange rates (ignored if they look wrong). */
export function setRates(next: Partial<FxRates> | null | undefined) {
  if (!next) return
  const eur = Number(next.EUR)
  const cny = Number(next.CNY)
  const eurOk = eur > 0.5 && eur < 1.5
  const merged: FxRates = {
    EUR: eurOk ? eur : rates.EUR,
    CNY: cny > 4 && cny < 10 ? cny : rates.CNY,
  }
  const live = ratesLive || eurOk
  if (merged.EUR === rates.EUR && merged.CNY === rates.CNY && live === ratesLive) return
  rates = merged
  ratesLive = live
  if (typeof window !== 'undefined') notify()
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** Messages in the visitor's language. */
export function useT(): Messages {
  return MESSAGES[usePrefs().lang]
}

export type DisplayPrice = {
  /** Main price in the chosen currency, e.g. "$64.24" or "57,17 €". */
  main: string | null
  /** Seller's yuan price, e.g. "¥399". */
  cny: string | null
  /** Numeric value in US dollars, for totals. */
  usd: number | null
  /** The raw sheet text, shown only when nothing could be parsed. */
  raw: string
}

/** Turns a sheet price into display strings for the visitor's language + currency. */
export function usePriceFormatter() {
  const { lang, currency, rates: fx } = usePrefs()
  return useCallback(
    (raw: string): DisplayPrice => {
      const n = parsePriceNumbers(raw, fx)
      return {
        main: n.usd != null ? formatMoney(n.usd, currency, lang, fx) : null,
        cny: n.cny != null ? formatYuan(n.cny, lang) : null,
        usd: n.usd,
        raw: raw.trim(),
      }
    },
    [lang, currency, fx],
  )
}
