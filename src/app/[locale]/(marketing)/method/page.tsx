import type { Metadata } from 'next';
import { constructCanonicalMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await params;
    return constructCanonicalMetadata('/method', locale);
}

import { getDictionary, type Locale } from "@/i18n/getDictionary";
import { MethodPageContent } from "@/components/MethodPageContent";

export default async function MethodPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    return (
        <main className="min-h-screen bg-background">
            <MethodPageContent dict={dict.methodPage} locale={locale} />
        </main>
    );
}
