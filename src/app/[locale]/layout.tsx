import { type Metadata } from 'next'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import '../globals.css'
import { BrowserExtensionFix } from '@/components/BrowserExtensionFix'
import { GlobalHeader } from '@/components/GlobalHeader'
import { getDictionary } from '@/i18n/getDictionary'
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
  title: 'Natural Fluency',
  description: 'The boutique approach to fluency.',
}


export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}>) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <>
      <div className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen`}>
        <BrowserExtensionFix />
        {children}
      </div>
    </>
  )
}