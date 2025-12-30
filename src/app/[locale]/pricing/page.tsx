import { HomeNavbar } from "@/components/HomeNavbar";
import { getDictionary, type Locale } from "@/i18n/getDictionary";
import { PricingPageContent } from "@/components/PricingPageContent";

export default async function PricingPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-electric/30 selection:text-electric-foreground relative overflow-hidden font-sans">
            <HomeNavbar dict={dict.nav} locale={locale} />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-electric/5 rounded-full blur-[120px] opacity-40" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[120px] opacity-30" />
            </div>

            <main className="relative z-10 container mx-auto px-6 pt-32 pb-32">
                <PricingPageContent dict={dict.pricingPage} locale={locale} />
            </main>
        </div>
    );
}
