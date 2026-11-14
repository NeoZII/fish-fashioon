'use client'

/**
 * Fire-and-forget counters for Trending and the funnel (see app/api/track).
 * sendBeacon survives the page being left (e.g. right after tapping BUY).
 */
type Event = { t: 'buy'; k: string } | { t: 'visit'; s: string } | { t: 'signup'; p: SignupPlace }
export type SignupPlace = 'gate' | 'howtobuy' | 'promo' | 'guide'

export function track(event: Event) {
  try {
    const body = JSON.stringify(event)
    if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon('/api/track', new Blob([body], { type: 'text/plain' }))) return
    void fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {})
  } catch {
    // counting must never break the page
  }
}

const SOURCES: [RegExp, string][] = [
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)discord(app)?\.com$|(^|\.)discord\.gg$/, 'discord'],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, 'youtube'],
  [/(^|\.)reddit\.com$/, 'reddit'],
  [/(^|\.)(x|twitter)\.com$|^t\.co$/, 'x'],
  [/(^|\.)google\./, 'google'],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, 'whatsapp'],
  [/(^|\.)t\.me$|(^|\.)telegram\.org$/, 'telegram'],
  [/(^|\.)snapchat\.com$/, 'snapchat'],
]

/** Where this visit came from: ?src= / utm_source first, then the referrer. */
export function visitSource(): string {
  try {
    const params = new URLSearchParams(window.location.search)
    const tagged = params.get('src') || params.get('utm_source')
    if (tagged) return tagged.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40) || 'other'
    if (!document.referrer) return 'direct'
    const host = new URL(document.referrer).hostname.toLowerCase()
    if (host === window.location.hostname) return 'direct'
    for (const [re, name] of SOURCES) if (re.test(host)) return name
    return 'other'
  } catch {
    return 'other'
  }
}
