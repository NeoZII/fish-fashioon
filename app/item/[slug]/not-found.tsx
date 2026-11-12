import Link from 'next/link'

export default function ItemNotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-background px-6 text-center">
      <div className="p3-stripes pointer-events-none absolute inset-0 opacity-40" />
      <h1 className="relative font-display text-5xl italic tracking-wide text-foreground md:text-7xl">
        THIS FIND IS GONE
      </h1>
      <p className="relative max-w-md font-mono text-xs leading-relaxed tracking-wide text-muted-foreground">
        The item was removed or its link changed. Thousands of other finds are still up.
      </p>
      <div className="relative flex flex-wrap justify-center gap-3">
        <Link
          href="/all"
          className="flex min-h-[48px] items-center bg-foreground px-6 font-mono text-xs font-bold tracking-[0.25em] text-background hover:bg-primary hover:text-primary-foreground"
          style={{ transform: 'skewX(-8deg)' }}
        >
          BROWSE ALL ITEMS
        </Link>
        <Link
          href="/latest"
          className="flex min-h-[48px] items-center border border-border px-6 font-mono text-xs font-bold tracking-[0.25em] text-foreground hover:border-primary hover:text-primary"
          style={{ transform: 'skewX(-8deg)' }}
        >
          LATEST DROPS
        </Link>
      </div>
    </main>
  )
}
