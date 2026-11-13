import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Anton, Geist, Geist_Mono, Oswald } from 'next/font/google'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'
import { LandingTracker } from '@/components/landing-tracker'
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
      className={`dark bg-background ${geist.variable} ${geistMono.variable} ${anton.variable} ${oswald.variable}`}
    >
      <body className="antialiased font-sans">
        <LandingTracker />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
