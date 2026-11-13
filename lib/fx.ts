import { FALLBACK_RATES, type FxRates } from './money'

/**
 * Daily USD→EUR reference rate (European Central Bank, via Frankfurter: free,
 * no key). The yuan rate is NOT taken from the ECB: yuan-only prices are
 * converted with Kakobuy's own rate (FALLBACK_RATES.CNY), which is what buyers
 * are actually charged. Read through the Next.js Data Cache, so the rate service is called
 * at most a couple of times a day. If it is slow, down or returns nonsense,
 * this resolves to null and the site keeps its built-in fallback rates.
 */
const FX_URL = 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR'
const FX_REVALIDATE = 60 * 60 * 6

function valid(n: unknown, min: number, max: number): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > min && n < max
}

export async function getRates(): Promise<FxRates | null> {
  try {
    const res = await fetch(FX_URL, {
      next: { revalidate: FX_REVALIDATE },
      signal: AbortSignal.timeout(2500),
    })
    if (!res.ok) throw new Error(`FX responded ${res.status}`)
    const data = (await res.json()) as { rates?: Partial<FxRates> }
    const eur = data.rates?.EUR
    // Sanity bounds so a bad response can never show absurd prices.
    if (!valid(eur, 0.5, 1.5)) throw new Error('FX rate out of range')
    return { EUR: eur, CNY: FALLBACK_RATES.CNY }
  } catch (err) {
    console.warn('[fx] rates unavailable, clients keep fallback rates:', err)
    return null
  }
}
