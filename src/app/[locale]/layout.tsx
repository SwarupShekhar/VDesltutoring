import { type Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import '../globals.css'
import { BrowserExtensionFix } from '@/components/BrowserExtensionFix'
import type { Locale } from '@/i18n/getDictionary'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Englivo',
  description: 'The boutique approach to fluency.',
  manifest: '/manifest.json',
  themeColor: '#6366f1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Englivo',
    startupImage: [
      {
        url: '/icons/splash.png',
        media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-512x512.png',
  },
}


export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}>) {
  const { locale } = await params

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}>
      <BrowserExtensionFix />
      {children}
    </div>
  )
}