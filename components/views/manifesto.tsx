'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { ViewShell } from '@/components/view-shell'

type Step = {
  k: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    k: '01',
    title: 'CREATE AN ACCOUNT',
    body: 'Sign up on Kakobuy using the link below. Important — use this link so your coupons apply.',
  },
  {
    k: '02',
    title: 'FIND YOUR ITEM',
    body: 'Search directly on the website for the piece you want.',
  },
  {
    k: '03',
    title: 'ADD TO CART',
    body: 'Choose the size, color, or variation if needed, then click “Add to Cart” or “Buy Now.”',
  },
  {
    k: '04',
    title: 'PAY FOR THE ITEM · 1ST PAYMENT',
    body: 'This is the item cost only (not shipping yet). Kakobuy then buys it from the seller for you.',
  },
  {
    k: '05',
    title: 'WAIT FOR WAREHOUSE ARRIVAL',
    body: 'Once the seller ships it, it heads to Kakobuy’s warehouse in China. You’ll get photos on arrival — inspect quality and ask for measurements.',
  },
  {
    k: '06',
    title: 'SHIP TO YOUR HOME · 2ND PAYMENT',
    body: 'When you’re happy, click “Ship Now.” Choose a shipping method (EMS, DHL, YunExpress), packaging options (remove boxes, combine parcels), and pay the international shipping fee.',
  },
  {
    k: '07',
    title: 'TRACK YOUR PARCEL',
    body: 'You’ll get a tracking number — follow it on Kakobuy or 17track.net. Delivery takes about 1–3 weeks depending on the method.',
  },
  {
    k: '08',
    title: 'RECEIVE YOUR PACKAGE',
    body: 'Once it arrives, check your items. If something’s wrong, contact support or leave feedback.',
  },
]

const SIGNUP_URL = 'https://ikako.vip/r/dqh2u'

export function Manifesto({ onBack }: { onBack: () => void }) {
  return (
    <ViewShell index="04" title="HOW TO BUY" subtitle="THE TUTORIAL" accent="primary" onBack={onBack}>
      <div className="mb-10 max-w-xl text-pretty font-mono text-sm leading-relaxed text-muted-foreground">
        {'Eight steps from account to doorstep. Follow them in order — start with the account link so your coupons lock in.'}
      </div>

      <motion.a
        href={SIGNUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-12 flex min-h-[52px] w-full items-center justify-between gap-3 bg-primary px-6 py-4 font-mono text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-foreground hover:text-background sm:w-auto"
      >
        Create your account
        <ArrowUpRight className="size-5 shrink-0" />
      </motion.a>

      <div className="flex flex-col gap-px border-y border-border bg-border">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.k}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3 bg-background py-6 sm:flex-row sm:gap-6"
          >
            <span className="font-display text-3xl italic leading-none text-primary sm:text-4xl">
              {s.k}
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-display text-lg italic tracking-wide text-foreground sm:text-xl">
                {s.title}
              </h3>
              <p className="max-w-xl text-pretty font-mono text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </ViewShell>
  )
}
