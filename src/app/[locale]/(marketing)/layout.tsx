import type { Metadata } from 'next'
import { HomeNavbar } from '@/components/HomeNavbar'
import { Footer } from '@/components/Footer'
import { getDictionary } from '@/i18n/getDictionary'
import type { Locale } from '@/i18n/getDictionary'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await params
    const baseUrl = 'https://englivo.com'

    // English content is served at root (no /en prefix)
    // Other languages use locale prefix (/de, /fr, /es, /vi, /ja)
    return {
        alternates: {
            canonical: baseUrl, // Always points to root for homepage
            languages: {
                'x-default': baseUrl, // Default language (English)
                'en': baseUrl, // English at root
                'de': `${baseUrl}/de`,
                'fr': `${baseUrl}/fr`,
                'es': `${baseUrl}/es`,
                'vi': `${baseUrl}/vi`,
                'ja': `${baseUrl}/ja`,
            }
        }
    }
}

export default async function MarketingLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return (
        <>
            <HomeNavbar dict={dict.nav} locale={locale} />
            <main className="flex-grow">
                {children}
            </main>
            <Footer dict={dict.footer} locale={locale} />
        </>
    )
}
