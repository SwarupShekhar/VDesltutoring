import type { Metadata } from 'next';
import { constructCanonicalMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    return {
        ...constructCanonicalMetadata('/how-it-works', locale),
        title: dict.howItWorksPage.title || 'How It Works | Englivo',
        description: dict.howItWorksPage.description || 'Learn how Englivo\'s AI-powered English fluency training works with live practice and personalized coaching.',
    };
}

import { getDictionary, type Locale } from "@/i18n/getDictionary";
import { HowItWorksPageContent } from "@/components/HowItWorksPageContent";
import { JsonLd } from "@/components/seo/JsonLd";

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    const howItWorksSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How Englivo Works",
      "description": "Learn how Englivo's English fluency training works with live practice and personalized coaching.",
      "url": `https://englivo.com/${locale}/how-it-works`,
      "audience": {
        "@type": "Audience",
        "audienceType": "ESL Professionals, executives, and advanced learners wanting fluency automaticity"
      },
      "about": [
        {
          "@type": "Thing",
          "name": "Active recall",
          "sameAs": "https://en.wikipedia.org/wiki/Active_recall"
        },
        {
          "@type": "Thing",
          "name": "Speech Reflex",
          "sameAs": "https://en.wikipedia.org/wiki/Reflex"
        }
      ],
      "step": [
        {
          "@type": "HowToStep",
          "name": "Reflex Training",
          "text": "Submit brief speech reflexes in real situational contexts to force your brain to think directly in English.",
          "url": `https://englivo.com/${locale}/how-it-works#step-1`
        },
        {
          "@type": "HowToStep",
          "name": "Instant AI Feedback",
          "text": "Receive immediate CEFR-aligned signals on vocabulary, grammar, and delivery errors.",
          "url": `https://englivo.com/${locale}/how-it-works#step-2`
        },
        {
          "@type": "HowToStep",
          "name": "Personalized Coaching",
          "text": "Apply your speech reflexes with expert tutors in live, 1-on-1 boutique scenarios.",
          "url": `https://englivo.com/${locale}/how-it-works#step-3`
        }
      ]
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-electric/30 selection:text-electric-foreground relative overflow-hidden font-sans">
            <JsonLd schema={howItWorksSchema} />


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
