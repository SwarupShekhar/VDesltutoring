import type { Metadata } from 'next';
import { constructCanonicalMetadata } from '@/lib/seo';
import { getDictionary, type Locale } from "@/i18n/getDictionary";
import { FluencyGuideContent } from '@/components/content/FluencyGuideContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);
    const seo = constructCanonicalMetadata('/fluency-guide', locale);

    const t = dictionary?.fluencyGuide || {};
    const heroTitle = t.hero?.title || "Englivo Fluency Guide";
    const heroSubtitle = t.hero?.subtitle || "From Translating → Thinking → Speaking";
    const heroDesc = t.hero?.description || "Your map from A2 → C1 without grammar overload.";

    // Clean up title and description (strip potential HTML tags like <br/>)
    const cleanTitle = `${heroTitle} – ${heroSubtitle}`.replace(/<[^>]*>/g, ' ').trim();
    const cleanDesc = heroDesc.replace(/<[^>]*>/g, ' ').trim();

    return {
        title: cleanTitle,
        description: cleanDesc,
        openGraph: {
            type: "article",
            title: cleanTitle,
            description: cleanDesc,
        },
        ...seo
    };
}

export default async function FluencyGuidePage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    // JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: "Englivo Fluency Guide – From Translating → Thinking → Speaking",
        description: "Your map from A2 → C1 without grammar overload.",
        author: {
            '@type': 'Organization',
            name: 'Englivo'
        },
        // Breadcrumb Schema
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://englivo.com/fluency-guide"
        }
    };

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                "@type": "Question",
                "name": "What is the English Fluency Gap?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The gap between knowing grammar rules (B1) and speaking automatically without translation (B2+)."
                }
            },
            {
                "@type": "Question",
                "name": "How do I stop translating in my head?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "By practicing 'reflex training' - forcing your brain to respond in English chunks rather than constructing sentences word by word."
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <FluencyGuideContent locale={locale} content={dictionary} />
        </>
    );
}
