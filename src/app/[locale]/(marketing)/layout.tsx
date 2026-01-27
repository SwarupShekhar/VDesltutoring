import type { Metadata } from 'next'
import { HomeNavbar } from '@/components/HomeNavbar'
import { Footer } from '@/components/Footer'
import { getDictionary } from '@/i18n/getDictionary'
import type { Locale } from '@/i18n/getDictionary'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await params

    // Get the current path without the locale prefix
    // For the homepage, this will be just '/'
    const baseUrl = 'https://englivo.com'

    // For the marketing homepage, canonical should always point to the base domain
    // without the locale prefix (i.e., https://englivo.com instead of https://englivo.com/en)
    return {
        alternates: {
            canonical: baseUrl,
            languages: {
                'en': `${baseUrl}/en`,
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
