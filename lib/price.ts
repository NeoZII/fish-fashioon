/**
 * Split a raw price string into a primary USD value and an optional
 * secondary CNY value. Handles single-currency strings ("$180") as well
 * as combined feeds like "$37.00 , ¥ 240,50" (comma = decimal separator)
 * and Kakobuy's "￥399 ≈ $ 64.24".
 */
export function parsePrice(raw: string): { usd: string; cny: string | null } {
  const usdMatch = raw.match(/\$\s*[\d.,]+/)
  const cnyMatch = raw.match(/[¥￥]\s*[\d.,]+/)

  const usd = usdMatch ? usdMatch[0].replace(/\s+/g, '') : raw.trim()

  let cny: string | null = null
  if (cnyMatch) {
    let num = cnyMatch[0].replace(/[¥￥\s]/g, '')
    // "240,50" -> comma is a decimal separator when only 1–2 trailing digits.
    if (/,\d{1,2}$/.test(num)) num = num.replace(',', '.')
    cny = `¥${num}`
  }

  return { usd, cny }
}
