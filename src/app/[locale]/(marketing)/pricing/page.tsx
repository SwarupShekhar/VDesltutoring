import type { Metadata } from 'next';
import { constructCanonicalMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        ...constructCanonicalMetadata('/pricing', locale),
        title: 'Pricing | Englivo',
        description: 'Choose the perfect Englivo plan for your English fluency journey. Flexible pricing with expert tutors and AI practice.',
    };
}

import { getDictionary, type Locale } from "@/i18n/getDictionary";
import { PricingPageContent } from "@/components/PricingPageContent";
import { JsonLd } from "@/components/seo/JsonLd";

export default async function PricingPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    const pricingSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Englivo Fluency Program",
      "image": "https://englivo.com/images/hero-preview.png",
      "description": "Premium English fluency coaching and AI-powered reflex training program for professionals and global job seekers.",
      "brand": {
        "@type": "Brand",
        "name": "Englivo"
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "49.00",
        "highPrice": "199.00",
        "offerCount": "3",
        "offers": [
          {
            "@type": "Offer",
            "name": "Starter Plan",
            "price": "49.00",
            "priceCurrency": "USD",
            "url": `https://englivo.com/${locale}/pricing`
          },
          {
            "@type": "Offer",
            "name": "Pro Plan",
            "price": "99.00",
            "priceCurrency": "USD",
            "url": `https://englivo.com/${locale}/pricing`
          },
          {
            "@type": "Offer",
            "name": "Executive Plan",
            "price": "199.00",
            "priceCurrency": "USD",
            "url": `https://englivo.com/${locale}/pricing`
          }
        ]
      }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-electric/30 selection:text-electric-foreground relative overflow-hidden font-sans">
            <JsonLd schema={pricingSchema} />


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
