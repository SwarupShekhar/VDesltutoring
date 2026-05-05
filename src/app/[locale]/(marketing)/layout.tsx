import type { Metadata } from 'next'
import { HomeNavbar } from '@/components/HomeNavbar'
import { Footer } from '@/components/Footer'
import { getDictionary } from '@/i18n/getDictionary'
import type { Locale } from '@/i18n/getDictionary'
import { VisualEditing } from 'next-sanity/visual-editing'
import { draftMode } from 'next/headers'
import { client } from '@/sanity/lib/client'
import { NAV_PAGES_QUERY } from '@/sanity/lib/queries'
import type { NavPage } from '@/types/sanity'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await params
    return {}
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
    const isDraftMode = (await draftMode()).isEnabled

    // Fetch dynamic pages for Navbar and Footer
    const fetchClient = isDraftMode
        ? client.withConfig({
            perspective: 'previewDrafts',
            useCdn: false,
            stega: { enabled: true, studioUrl: '/studio' }
          })
        : client

    const navPages = await fetchClient.fetch<NavPage[]>(NAV_PAGES_QUERY, { locale }, {
        next: { revalidate: 3600 }
    })

    return (
        <>
            <HomeNavbar dict={dict.nav} locale={locale} navPages={navPages} />
            <main className="grow">
                {children}
            </main>
            <Footer dict={dict.footer} locale={locale} navPages={navPages} />
            {isDraftMode && <VisualEditing />}
        </>
    )
}
