import type { Metadata } from 'next';
import { constructCanonicalMetadata } from '@/lib/seo';
import { getDictionary, type Locale } from '@/i18n/getDictionary';
import { FAQSection } from '@/components/FAQSection';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    const faqHeadline = dict.faq?.headline;
    return {
        ...constructCanonicalMetadata('/faq', locale),
        title: faqHeadline ? `${faqHeadline} | Englivo` : 'FAQ | Englivo',
        description: 'Answers to common questions about Englivo — how the AI tutor works, CEFR levels, pricing, and getting started with English fluency training.',
    };
}

export default async function FAQPage({
    params,
}: {
    params: Promise<{ locale: Locale }>;
}) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-6 pt-32 pb-32 max-w-3xl">
                <h1 className="font-serif text-4xl md:text-5xl mb-4 text-foreground">
                    Frequently Asked Questions
                </h1>
                <p className="text-muted-foreground text-lg mb-16">
                    Everything you need to know about Englivo.
                </p>
                <FAQSection content={dict.faq} />
            </main>
        </div>
    );
}
