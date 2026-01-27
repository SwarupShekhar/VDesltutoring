import type { Metadata } from 'next';
import { constructCanonicalMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await params;
    return constructCanonicalMetadata('/how-it-works', locale);
}

import { getDictionary, type Locale } from "@/i18n/getDictionary";
import { HowItWorksPageContent } from "@/components/HowItWorksPageContent";

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-electric/30 selection:text-electric-foreground relative overflow-hidden font-sans">


            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 left-0 w-[600px] h-[600px] bg-electric/5 rounded-full blur-[120px] opacity-40" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] opacity-30" />
            </div>

            <main className="relative z-10 container mx-auto px-6 pt-32 pb-32 max-w-5xl">
                <HowItWorksPageContent dict={dict.howItWorksPage} />
            </main>
        </div>
    );
}
