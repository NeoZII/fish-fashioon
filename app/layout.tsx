import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Anton, Geist, Geist_Mono, Oswald } from 'next/font/google'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'
import { LandingTracker } from '@/components/landing-tracker'
import { BuyGate } from '@/components/buy-gate'
import './globals.css'

// Geist (body sans) is only used for a little text (e.g. the promo popup), so
// it isn't preloaded: the first paint only waits on Anton + Geist Mono.
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', preload: false })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton' })
// Anton has no Cyrillic: the Russian interface swaps display text to Oswald
// (see html:lang(ru) in globals.css). Not preloaded, so only Russian visitors
// ever download it.
const oswald = Oswald({ subsets: ['cyrillic', 'latin'], weight: '700', variable: '--font-oswald', preload: false })
// Polish (ą ę ł ś ż…) and Russian body text: the main fonts above only carry
// the basic Latin set, so these fuller copies are used for <html lang="pl|ru">
// only (see globals.css). Not preloaded: English/French visitors never load them.
const geistIntl = Geist({ subsets: ['cyrillic', 'latin', 'latin-ext'], variable: '--font-geist-intl', preload: false })
const geistMonoIntl = Geist_Mono({
  subsets: ['cyrillic', 'latin', 'latin-ext'],
  variable: '--font-geist-mono-intl',
  preload: false,
})
const antonPl = Anton({ subsets: ['latin', 'latin-ext'], weight: '400', variable: '--font-anton-pl', preload: false })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark bg-background ${geist.variable} ${geistMono.variable} ${anton.variable} ${oswald.variable} ${geistIntl.variable} ${geistMonoIntl.variable} ${antonPl.variable}`}
    >
      <body className="antialiased font-sans">
        <LandingTracker />
        {children}
        <BuyGate />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
