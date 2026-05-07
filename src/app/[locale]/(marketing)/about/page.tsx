import type { Metadata } from 'next';
import { constructCanonicalMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        ...constructCanonicalMetadata('/about', locale),
        title: 'About Us | Englivo',
        description: 'Learn about Englivo\'s mission to make English fluency accessible through AI-powered learning and expert tutoring.',
    };
}

import { getDictionary, type Locale } from "@/i18n/getDictionary";
import { AboutPageContent } from "@/components/AboutPageContent";
import { JsonLd } from "@/components/seo/JsonLd";

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    const aboutSchema = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About Us | Englivo",
      "description": "Learn about Englivo's mission to make English fluency accessible through AI-powered learning and expert tutoring.",
      "url": `https://englivo.com/${locale}/about`,
      "audience": {
        "@type": "Audience",
        "audienceType": "Non-native English speaking professionals, language learners, global job seekers"
      },
      "about": [
        {
          "@type": "Thing",
          "name": "Language education",
          "sameAs": "https://en.wikipedia.org/wiki/Language_education"
        },
        {
          "@type": "Thing",
          "name": "Tutoring",
          "sameAs": "https://en.wikipedia.org/wiki/Tutor"
        }
      ],
      "mainEntity": {
        "@type": "EducationalOrganization",
        "name": "Englivo",
        "url": "https://englivo.com"
      }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-electric/30 selection:text-electric-foreground relative overflow-hidden font-sans">
            <JsonLd schema={aboutSchema} />


            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-electric/5 rounded-full blur-[120px] opacity-30" />
            </div>

            <main className="relative z-10 container mx-auto px-6 pt-32 pb-32">
                <AboutPageContent dict={dict.nav.aboutPage} />
            </main>
        </div>
    );
}
