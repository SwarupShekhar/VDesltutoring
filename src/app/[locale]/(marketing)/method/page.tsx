import type { Metadata } from 'next';
import { constructCanonicalMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    return {
        ...constructCanonicalMetadata('/method', locale),
        title: dict.methodPage.title || 'Our Method | Englivo',
        description: dict.methodPage.description || 'Discover Englivo\'s proven method for mastering English fluency through real conversations and smart practice.',
    };
}

import { getDictionary, type Locale } from "@/i18n/getDictionary";
import { MethodPageContent } from "@/components/MethodPageContent";
import { JsonLd } from "@/components/seo/JsonLd";

export default async function MethodPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    const methodSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Our Method | Englivo",
      "description": "Discover Englivo's proven method for mastering English fluency through real conversations, reflex training, and avoiding grammar overload.",
      "url": `https://englivo.com/${locale}/method`,
      "audience": {
        "@type": "Audience",
        "audienceType": "ESL Learners seeking automaticity, professionals facing the intermediate plateau"
      },
      "about": [
        {
          "@type": "Thing",
          "name": "Reflex-based learning",
          "sameAs": "https://en.wikipedia.org/wiki/Reflex"
        },
        {
          "@type": "Thing",
          "name": "Second language acquisition",
          "sameAs": "https://en.wikipedia.org/wiki/Second-language_acquisition"
        },
        {
          "@type": "Thing",
          "name": "Common European Framework of Reference for Languages",
          "sameAs": "https://en.wikipedia.org/wiki/Common_European_Framework_of_Reference_for_Languages"
        }
      ],
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Englivo",
        "url": "https://englivo.com"
      }
    };

    return (
        <main className="min-h-screen bg-background">
            <JsonLd schema={methodSchema} />
            <MethodPageContent dict={dict.methodPage} locale={locale} />
        </main>
    );
}
