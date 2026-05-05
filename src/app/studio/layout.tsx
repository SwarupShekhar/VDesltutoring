import { Metadata } from 'next'
import { viewport as studioViewport } from 'next-sanity/studio'

// Set viewport for Sanity Studio
export const viewport = studioViewport

export const metadata: Metadata = {
  title: 'Sanity Studio',
  robots: 'noindex, nofollow',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
