'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ViewId } from '@/lib/data'
import { SECTION_META, VIEW_PATHS, viewFromPath } from '@/lib/sections'
import { useGlobalItems } from '@/hooks/use-global-items'
import { P3Menu } from '@/components/p3-menu'
import { PromoModal } from '@/components/promo-modal'
import { LoadingScreen } from '@/components/loading-screen'
import { TransitionCurtain } from '@/components/transition-curtain'
import { LatestDrops } from '@/components/views/latest-drops'
import { TheArchive } from '@/components/views/the-archive'
import { Sellers } from '@/components/views/sellers'
import { Manifesto } from '@/components/views/manifesto'
import { Socials } from '@/components/views/socials'
import { Countdown } from '@/components/views/countdown'

export function Experience({ initialView = 'menu' }: { initialView?: ViewId }) {
  const { globalItems, loading } = useGlobalItems()
  // When this component remounts after a client-side navigation (e.g. Back
  // from an item page), trust the address bar over the route's default view.
  const [view, setView] = useState<ViewId>(() =>
    typeof window === 'undefined' ? initialView : (viewFromPath(window.location.pathname) ?? initialView),
  )
  const [curtain, setCurtain] = useState(false)
  const lock = useRef(false)
  const viewRef = useRef(view)
  viewRef.current = view

  /** Curtain transition to another view; `push` adds a browser history entry. */
  const transition = useCallback((target: ViewId, push: boolean) => {
    if (target === viewRef.current) return
    if (push) window.history.pushState(null, '', VIEW_PATHS[target])
    if (lock.current) {
      // Mid-animation (e.g. rapid Back presses): switch without a second curtain.
      setView(target)
      return
    }
    lock.current = true
    setCurtain(true)
    // swap the view while the screen is fully covered
    window.setTimeout(() => {
      setView(target)
      window.scrollTo({ top: 0 })
    }, 440)
    // lift the curtain
    window.setTimeout(() => {
      setCurtain(false)
      lock.current = false
    }, 980)
  }, [])

  const navigate = useCallback((target: ViewId) => transition(target, true), [transition])

  // Keep the browser tab title in sync with the section on screen.
  useEffect(() => {
    document.title = view === 'menu' ? 'Fashion Sea' : `${SECTION_META[view].title} · Fashion Sea`
  }, [view])

  // Browser Back/Forward between sections plays the same curtain transition.
  useEffect(() => {
    const onPop = () => transition(viewFromPath(window.location.pathname) ?? 'menu', false)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [transition])

  const back = useCallback(() => navigate('menu'), [navigate])

  return (
    <div className="relative min-h-dvh bg-background">
      <PromoModal />
      <TransitionCurtain show={curtain} />
      <div key={view}>
        {view === 'menu' && <P3Menu onNavigate={navigate} items={globalItems} />}
        {view === 'drops' && (loading ? <LoadingScreen /> : <LatestDrops items={globalItems} onBack={back} />)}
        {view === 'archive' && (loading ? <LoadingScreen /> : <TheArchive items={globalItems} onBack={back} />)}
        {view === 'sellers' && (loading ? <LoadingScreen /> : <Sellers items={globalItems} onBack={back} />)}
        {view === 'manifesto' && <Manifesto onBack={back} />}
        {view === 'socials' && <Socials onBack={back} />}
        {view === 'countdown' && <Countdown onBack={back} />}
      </div>
    </div>
  )
}
