'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Link2, Share2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Props = {
  /** Absolute URL to share. Defaults to the current page. */
  url?: string
  /** Short title (used by the native share sheet, Reddit, X). */
  title: string
  /** One-line message that goes with the link. */
  text?: string
  className?: string
  label?: string
  /** Preview image to warm up before the link is shared (so apps get it instantly). */
  previewImage?: string
}

const enc = encodeURIComponent

/**
 * Share anywhere.
 * - Phones/tablets: opens the system share sheet (WhatsApp, Instagram,
 *   Snapchat, Telegram, Messages, Discord… whatever the visitor has).
 * - Desktop: a small panel with one-click links for the platforms that support
 *   share URLs, plus "Copy link" for those that don't (Discord, Instagram, TikTok).
 * Every link carries the page's Open Graph tags, so it unfurls into a preview
 * card on all of these platforms.
 */
export function ShareButton({ url, title, text, className = '', label = 'SHARE', previewImage }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const shareUrl = () => url ?? window.location.href
  const message = text ?? title

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function onShare() {
    // Ask the server to build/cache the preview card now, while the visitor
    // picks an app; by the time WhatsApp/Discord fetch it, it's ready.
    if (previewImage) fetch(previewImage, { priority: 'low' } as RequestInit).catch(() => {})
    const touch = window.matchMedia('(pointer: coarse)').matches
    if (touch && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text: message, url: shareUrl() })
        return
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return // user closed the sheet
      }
    }
    setOpen((o) => !o)
  }

  async function copy() {
    const link = shareUrl()
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // Older browsers: fall back to a hidden textarea.
      const ta = document.createElement('textarea')
      ta.value = link
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const targets = () => {
    const u = shareUrl()
    return [
      { name: 'WhatsApp', href: `https://wa.me/?text=${enc(`${message} ${u}`)}` },
      { name: 'Telegram', href: `https://t.me/share/url?url=${enc(u)}&text=${enc(message)}` },
      { name: 'X / Twitter', href: `https://x.com/intent/post?url=${enc(u)}&text=${enc(message)}` },
      { name: 'Reddit', href: `https://www.reddit.com/submit?url=${enc(u)}&title=${enc(title)}` },
      { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}` },
    ]
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={onShare}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex min-h-[44px] items-center gap-2 border border-border bg-background/60 px-4 font-mono text-[11px] font-bold tracking-[0.25em] text-foreground transition-colors hover:border-primary hover:text-primary"
        style={{ transform: 'skewX(-8deg)' }}
      >
        <Share2 className="size-4" aria-hidden />
        {label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-60 border border-border bg-card p-2 shadow-2xl"
          >
            <button
              type="button"
              role="menuitem"
              onClick={copy}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left font-mono text-[11px] font-bold tracking-[0.15em] text-foreground hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                {copied ? <Check className="size-4 text-primary" /> : <Link2 className="size-4" />}
                {copied ? 'COPIED' : 'COPY LINK'}
              </span>
              <span className="text-[9px] font-normal tracking-[0.1em] text-muted-foreground">
                DISCORD · IG · TIKTOK
              </span>
            </button>
            <div className="my-1 h-px bg-border" />
            {targets().map((t) => (
              <a
                key={t.name}
                role="menuitem"
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 font-mono text-[11px] font-bold tracking-[0.15em] text-foreground hover:bg-muted"
              >
                {t.name.toUpperCase()}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
