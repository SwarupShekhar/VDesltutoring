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
  variable: '--font-dm-serif-display',
  subsets: ['latin'],
})

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  // Ensure all pages are indexable by default
  return {
    robots: 'index, follow'
  }
}

// ... imports

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}>) {
  const { locale } = await params

  // Validate locale
  const validLocales = ["en", "de", "fr", "es", "vi", "ja"];
  if (!validLocales.includes(locale as string)) {
    notFound();
  }

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