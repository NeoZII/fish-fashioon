'use client'

import { useCallback, useRef, useState } from 'react'
import type { ViewId } from '@/lib/data'
import { useGlobalItems } from '@/hooks/use-global-items'
import { P3Menu } from '@/components/p3-menu'
import { LoadingScreen } from '@/components/loading-screen'
import { TransitionCurtain } from '@/components/transition-curtain'
import { LatestDrops } from '@/components/views/latest-drops'
import { TheArchive } from '@/components/views/the-archive'
import { Sellers } from '@/components/views/sellers'
import { Manifesto } from '@/components/views/manifesto'
import { Socials } from '@/components/views/socials'

export function Experience() {
  const { globalItems, loading } = useGlobalItems()
  const [view, setView] = useState<ViewId>('menu')
  const [curtain, setCurtain] = useState(false)
  const lock = useRef(false)

  const navigate = useCallback(
    (target: ViewId) => {
      if (lock.current || target === view) return
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
    },
    [view],
  )

  const back = useCallback(() => navigate('menu'), [navigate])

  return (
    <div className="relative min-h-dvh bg-background">
      <TransitionCurtain show={curtain} />
      <div key={view}>
        {view === 'menu' && <P3Menu onNavigate={navigate} />}
        {view === 'drops' && (loading ? <LoadingScreen /> : <LatestDrops items={globalItems} onBack={back} />)}
        {view === 'archive' && (loading ? <LoadingScreen /> : <TheArchive items={globalItems} onBack={back} />)}
        {view === 'sellers' && (loading ? <LoadingScreen /> : <Sellers items={globalItems} onBack={back} />)}
        {view === 'manifesto' && <Manifesto onBack={back} />}
        {view === 'socials' && <Socials onBack={back} />}
      </div>
    </div>
  )
}
