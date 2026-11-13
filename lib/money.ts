/**
 * Prices: parse the sheet's free-text price into numbers, convert between
 * currencies, and format them for the visitor's language.
 *
 * The sheet mixes formats: "$37.00 , ¥240,50" (comma = decimals),
 * "￥399 ≈ $ 64.24" (Kakobuy), the odd "￥360 ≈ € 51.66", and a few rows with
 * only a yuan price or none at all.
 */

export type Currency = 'USD' | 'EUR'

/** How many units of each currency one US dollar buys. */
export type FxRates = { EUR: number; CNY: number }

/** Response header carrying the rates alongside the catalogue (read by the client). */
export const FX_HEADER = 'x-fx-usd'

/**
 * Used until the live rate arrives (and if the rate service is down).
 * EUR: ECB reference, Nov 2026 (1 EUR ≈ 1.12 USD).
 * CNY: the ratio Kakobuy itself uses in the catalogue's "￥ ≈ $" prices.
 */
export const FALLBACK_RATES: FxRates = { EUR: 0.89, CNY: 6.2 }

export type PriceNumbers = {
  /** Price in US dollars (converted when the sheet only has € or ¥). */
  usd: number | null
  /** Price in yuan as listed by the seller, when the sheet has it. */
  cny: number | null
}

/** "339,00" → 339, "1,234.56" → 1234.56, "64.24" → 64.24. Zero/garbage → null. */
function toNumber(text: string | undefined): number | null {
  if (!text) return null
  let t = text.replace(/[^\d.,]/g, '')
  // A comma followed by 1–2 digits at the end is a decimal comma.
  if (/,\d{1,2}$/.test(t)) t = t.replace(/\.(?=\d{3}(\D|$))/g, '').replace(/,(\d{1,2})$/, '.$1')
  t = t.replace(/,/g, '')
  const n = Number(t)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function parsePriceNumbers(raw: string, rates: FxRates = FALLBACK_RATES): PriceNumbers {
  const text = raw || ''
  const usd = toNumber(text.match(/\$\s*([\d.,]+)/)?.[1])
  const eur = toNumber(text.match(/€\s*([\d.,]+)/)?.[1])
  const cny = toNumber(text.match(/[¥￥]\s*([\d.,]+)/)?.[1])

  if (usd) return { usd, cny }
  if (eur) return { usd: eur / rates.EUR, cny }
  if (cny) return { usd: cny / rates.CNY, cny }
  return { usd: null, cny: null }
}

const LOCALES = { en: 'en-US', fr: 'fr-FR', ru: 'ru-RU', pl: 'pl-PL' } as const
export type LocaleLang = keyof typeof LOCALES

export function localeFor(lang: LocaleLang): string {
  return LOCALES[lang]
}

const formatters = new Map<string, Intl.NumberFormat>()
function formatter(lang: LocaleLang, currency: string, decimals: number): Intl.NumberFormat {
  const id = `${lang}|${currency}|${decimals}`
  let f = formatters.get(id)
  if (!f) {
    f = new Intl.NumberFormat(LOCALES[lang], {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    formatters.set(id, f)
  }
  return f
}

/** Format a US-dollar amount in the chosen currency ("$64.24", "57,17 €"). */
export function formatMoney(usd: number, currency: Currency, lang: LocaleLang, rates: FxRates): string {
  const amount = currency === 'EUR' ? usd * rates.EUR : usd
  return formatter(lang, currency, 2).format(amount)
}

/** Format a yuan amount ("¥399", "¥203.83", "399 ¥" in French). */
export function formatYuan(cny: number, lang: LocaleLang): string {
  return formatter(lang, 'CNY', Number.isInteger(Math.round(cny * 100) / 100) ? 0 : 2).format(cny)
}
