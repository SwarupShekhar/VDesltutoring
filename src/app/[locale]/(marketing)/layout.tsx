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

    // Base metadata for the layout
    // Canonical tags are now handled by individual pages to ensure subpages (like /method)
    // have correct self-referencing URLs.

    return {
        // Base metadata can go here if needed
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
