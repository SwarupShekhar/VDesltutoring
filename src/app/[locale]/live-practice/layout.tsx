import { getDictionary, type Locale } from '@/i18n/getDictionary';
import { HomeNavbar } from '@/components/HomeNavbar';

export default async function LivePracticeLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: Locale }>;
}) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    return (
        <div className="flex flex-col min-h-screen">
            <HomeNavbar locale={locale} dict={dict.nav} />
            <main className="flex-1">{children}</main>
        </div>
    );
}
