'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useT } from '@/lib/prefs'

/** Kakobuy codes that work with Fashion Sea. The codes are typed exactly like this on Kakobuy. */
export const COUPON_CODES = [
  { code: 'Fashionsea', key: 'fashionsea', tone: 'primary' },
  { code: 'seafinds', key: 'seafinds', tone: 'fav' },
] as const

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
}

/** Two tap-to-copy coupon chips plus where to enter them on Kakobuy. */
export function CouponCodes() {
  const t = useT()
  const [copied, setCopied] = useState<string | null>(null)

  const onCopy = async (code: string) => {
    await copyText(code)
    setCopied(code)
    window.setTimeout(() => setCopied((c) => (c === code ? null : c)), 1600)
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-[340px] border border-border bg-card/60 p-4">
      <h2 className="font-mono text-xs font-bold tracking-[0.25em] text-foreground">{t.codes.title}</h2>
      <div className="mt-3 flex flex-col gap-2">
        {COUPON_CODES.map(({ code, key, tone }) => {
          const done = copied === code
          const ring = tone === 'fav' ? 'border-fav hover:bg-fav/10' : 'border-primary hover:bg-primary/10'
          const accent = tone === 'fav' ? 'text-fav' : 'text-primary'
          return (
            <button
              key={code}
              type="button"
              onClick={() => onCopy(code)}
              aria-label={t.codes.copyAria(code)}
              className={`flex min-h-[52px] items-center justify-between gap-3 border-2 border-dashed px-4 text-left transition-colors ${ring}`}
            >
              <span className="flex flex-col">
                <span className="font-mono text-base font-bold tracking-[0.05em] text-foreground">{code}</span>
                <span className={`font-mono text-[11px] font-bold tracking-[0.15em] ${accent}`}>{t.codes[key]}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.15em] text-muted-foreground">
                {done ? <Check className={`size-4 ${accent}`} aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {done ? t.codes.copied : t.codes.tapToCopy}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted-foreground">{t.codes.how}</p>
    </section>
  )
}
