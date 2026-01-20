import { Metadata } from 'next';
import { FluencyGuideContent } from '@/components/content/FluencyGuideContent';

export const metadata: Metadata = {
    title: "Englivo Fluency Guide – From Translating to Thinking in English",
    description: "Central roadmap from A2 to C1 speaking using reflex training, CEFR signals and live practice.",
    openGraph: {
        type: "article",
        title: "Englivo Fluency Guide",
        description: "From Translating → Thinking → Speaking. Your map from A2 → C1.",
    }
};

export default async function FluencyGuidePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

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
            <FluencyGuideContent locale={locale} />
        </>
    );
}
