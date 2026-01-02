import { HomeNavbar } from '@/components/HomeNavbar'
import { Footer } from '@/components/Footer'
import { getDictionary } from '@/i18n/getDictionary'
import type { Locale } from '@/i18n/getDictionary'

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
