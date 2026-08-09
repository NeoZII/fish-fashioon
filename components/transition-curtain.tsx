'use client'

import { AnimatePresence, motion } from 'framer-motion'

const PANELS = [
  { color: 'var(--background)', clip: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)' },
  { color: 'var(--primary)', clip: 'polygon(0 0, 100% 0, 94% 100%, 6% 100%)' },
  { color: 'var(--secondary)', clip: 'polygon(6% 0, 100% 0, 100% 100%, 0 100%)' },
  { color: 'var(--foreground)', clip: 'polygon(0 0, 94% 0, 100% 100%, 0 100%)' },
]

export function TransitionCurtain({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-[100]">
          {PANELS.map((panel, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{
                background: panel.color,
                clipPath: panel.clip,
                transformOrigin: '0% 50%',
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1, 1, 0] }}
              exit={{ scaleX: 0 }}
              transition={{
                duration: 0.85,
                delay: i * 0.06,
                times: [0, 0.42, 0.58, 1],
                ease: [0.76, 0, 0.24, 1],
              }}
            />
          ))}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.85, times: [0, 0.42, 0.58, 1] }}
          >
            <span className="font-display text-4xl italic tracking-widest text-background md:text-7xl">
              FashionSea
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
