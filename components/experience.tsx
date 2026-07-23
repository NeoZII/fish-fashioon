'use client'

import { useCallback, useRef, useState } from 'react'
import type { ViewId } from '@/lib/data'
import { P3Menu } from '@/components/p3-menu'
import { TransitionCurtain } from '@/components/transition-curtain'
import { LatestDrops } from '@/components/views/latest-drops'
import { TheArchive } from '@/components/views/the-archive'
import { Manifesto } from '@/components/views/manifesto'
import { Network } from '@/components/views/network'

export function Experience() {
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
        {view === 'drops' && <LatestDrops onBack={back} />}
        {view === 'archive' && <TheArchive onBack={back} />}
        {view === 'manifesto' && <Manifesto onBack={back} />}
        {view === 'network' && <Network onBack={back} />}
      </div>
    </div>
  )
}
