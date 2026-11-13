'use client'

import { useT } from '@/lib/prefs'

export function LoadingScreen() {
  const t = useT()
  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-5 bg-background px-6">
      <div className="p3-stripes pointer-events-none absolute inset-0 opacity-30" />
      <span
        className="relative size-10 animate-spin rounded-full border-2 border-border border-t-primary"
        aria-hidden="true"
      />
      <p className="relative font-mono text-xs tracking-[0.4em] text-muted-foreground">
        {t.common.loading}
        <span className="sr-only"> {t.common.loadingSr}</span>
      </p>
    </div>
  )
}
