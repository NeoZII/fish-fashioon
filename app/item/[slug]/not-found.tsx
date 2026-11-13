'use client'

import Link from 'next/link'
import { useT } from '@/lib/prefs'

export default function ItemNotFound() {
  const t = useT()
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-background px-6 text-center">
      <div className="p3-stripes pointer-events-none absolute inset-0 opacity-40" />
      <h1 className="relative font-display text-5xl italic tracking-wide text-foreground md:text-7xl">
        {t.notFound.title}
      </h1>
      <p className="relative max-w-md font-mono text-xs leading-relaxed tracking-wide text-muted-foreground">
        {t.notFound.body}
      </p>
      <div className="relative flex flex-wrap justify-center gap-3">
        <Link
          href="/all"
          className="flex min-h-[48px] items-center bg-foreground px-6 font-mono text-xs font-bold tracking-[0.25em] text-background hover:bg-primary hover:text-primary-foreground"
          style={{ transform: 'skewX(-8deg)' }}
        >
          {t.notFound.browseAll}
        </Link>
        <Link
          href="/latest"
          className="flex min-h-[48px] items-center border border-border px-6 font-mono text-xs font-bold tracking-[0.25em] text-foreground hover:border-primary hover:text-primary"
          style={{ transform: 'skewX(-8deg)' }}
        >
          {t.notFound.latest}
        </Link>
      </div>
    </main>
  )
}
