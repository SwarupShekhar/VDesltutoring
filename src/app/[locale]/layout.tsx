import { type Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display, Inter, DM_Serif_Display } from 'next/font/google'
import '../globals.css'
import { BrowserExtensionFix } from '@/components/BrowserExtensionFix'
import type { Locale } from '@/i18n/getDictionary'
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

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

// Bringing in fonts from root layout to ensure consistency if used anywhere
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const viewport = {
  themeColor: '#6366f1',
}

export const metadata: Metadata = {
  metadataBase: new URL("https://englivo.com"),
  title: {
    default: "Englivo - English Fluency for Professionals",
    template: "%s | Englivo",
  },
  description: "Stop translating in your head. Build real English fluency with AI-powered speaking practice, CEFR-based feedback, and live coaching for professionals.",
  manifest: '/manifest.json',
  // themeColor moved to viewport export
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
  openGraph: {
    title: "Englivo - English Fluency for Professionals",
    description: "AI-powered English fluency training for professionals. Stop translating. Start speaking naturally.",
    url: "https://englivo.com",
    siteName: "Englivo",
    images: [
      {
        url: "https://englivo.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Englivo — English Fluency for Professionals",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Englivo - English Fluency for Professionals",
    description: "Stop translating in your head. Build real English fluency with AI-powered speaking practice.",
    images: ["https://englivo.com/og-image.png"],
  },
  verification: {
    google: "jk58qo7u4JdJ31q1TTYOQu6y7qzBPFYmmyj86rSi6TU",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=4" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=4",
    apple: "/apple-icon.png?v=4",
  },
  robots: 'index, follow',
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
    <ClerkProvider>
      {/* Suppress hydration warning because ThemeProvider modifies HTML attributes */}
      <html lang={locale} suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} ${dmSerif.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>

          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-7MTWCZ41GW"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', 'G-7MTWCZ41GW');
                `}
          </Script>
          <Script id="website-schema" type="application/ld+json">
            {`
                  {
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": "Englivo",
                    "url": "https://englivo.com",
                    "potentialAction": {
                      "@type": "SearchAction",
                      "target": "https://englivo.com/blog?q={search_term_string}",
                      "query-input": "required name=search_term_string"
                    }
                  }
                `}
          </Script>

          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <BrowserExtensionFix />
            {children}
            <Analytics />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}