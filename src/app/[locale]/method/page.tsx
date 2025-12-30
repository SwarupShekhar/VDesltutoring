import { HomeNavbar } from "@/components/HomeNavbar";
import { getDictionary, type Locale } from "@/i18n/getDictionary";
import { MethodPageContent } from "@/components/MethodPageContent";

export default async function MethodPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-electric/30 selection:text-electric-foreground relative overflow-hidden font-sans">
            <HomeNavbar dict={dict.nav} locale={locale} />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] opacity-50" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] opacity-30" />
            </div>

            <main className="relative z-10 container mx-auto px-6 pt-32 pb-32 max-w-4xl">
                <MethodPageContent dict={dict.methodPage} />
            </main>
        </div>
    );
}
