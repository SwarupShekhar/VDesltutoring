import { requireRole } from '@/lib/require-role'
import { HomeNavbar } from '@/components/HomeNavbar'
import { getDictionary } from '@/i18n/getDictionary'
import type { Locale } from '@/i18n/getDictionary'

export default async function PracticeModeLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    await requireRole(['LEARNER'], locale)
    const dict = await getDictionary(locale)

    return (
        <>
            <HomeNavbar dict={dict.nav} locale={locale} />
            {children}
        </>
    )
}
