'use client'

import { useT } from '@/lib/prefs'

/**
 * The how-to-buy walkthrough (vertical, silent, captions burned in).
 * preload="none": the 3 MB file only downloads when someone presses play,
 * the poster shows until then.
 */
export function HowToBuyVideo() {
  const t = useT()
  return (
    <figure className="mx-auto w-full max-w-[340px]">
      <div className="relative aspect-[9/16] w-full overflow-hidden border border-border bg-card shadow-2xl">
        <video
          className="absolute inset-0 size-full object-cover"
          src="/video/how-to-buy.mp4"
          poster="/video/how-to-buy-poster.jpg"
          controls
          playsInline
          muted
          preload="none"
          aria-label={t.video.title}
        />
      </div>
      <figcaption className="mt-3 flex flex-col gap-1">
        <span className="font-mono text-xs font-bold tracking-[0.25em] text-primary">{t.video.title}</span>
        <span className="font-mono text-[11px] leading-relaxed text-muted-foreground">{t.video.note}</span>
      </figcaption>
    </figure>
  )
}
