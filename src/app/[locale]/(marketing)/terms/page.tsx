import type { Metadata } from "next";
import { constructCanonicalMetadata } from "@/lib/seo";
import { type Locale } from "@/i18n/getDictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...constructCanonicalMetadata("/terms", locale),
    title: 'Terms of Service | Englivo English Fluency Platform',
    description: 'Review the terms, conditions, subscription rules, and acceptable usage guidelines for learning and practicing on Englivo.',
  };
}

const termsContent = {
  en: {
    title: "Terms of Service",
    effectiveDate: "Effective Date: March 10, 2026",
    intro:
      "Welcome to Englivo. By accessing and using our English fluency platform, you agree to be bound by these Terms of Service. Please read them carefully.",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        content: `By accessing or using Englivo, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform.`,
      },
      {
        heading: "2. Description of Service",
        content: `Englivo provides an AI-powered English fluency learning platform, including:
Interactive practice sessions with speech recognition
Personalized feedback on pronunciation and fluency
Progress tracking and performance analytics
Access to tutors for live sessions

We reserve the right to modify, suspend, or discontinue any part of our service at any time.`,
      },
      {
        heading: "3. User Accounts",
        content: `To access certain features of Englivo, you must create an account. You agree to:
Provide accurate and complete registration information
Maintain the security of your account credentials
Accept responsibility for all activities that occur under your account
Notify us immediately of any unauthorized use of your account

You must be at least 13 years old to create an account.`,
      },
      {
        heading: "4. Payment and Subscription",
        content: `Some features of Englivo require a paid subscription. By subscribing, you agree to:
Pay all applicable fees and charges
Provide valid payment information
Authorize us to charge your payment method for all subscriptions

Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period.`,
      },
      {
        heading: "5. User Conduct",
        content: `When using Englivo, you agree NOT to:
Violate any applicable laws or regulations
Infringe on the rights of others
Attempt to gain unauthorized access to our systems
Use the service for any illegal or harmful purpose
Harass, abuse, or harm other users or staff

We reserve the right to suspend or terminate accounts that violate these rules.`,
      },
      {
        heading: "6. Intellectual Property",
        content: `All content, features, and functionality of Englivo are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our service without our prior written consent.`,
      },
      {
        heading: "7. Limitation of Liability",
        content: `Englivo is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free. In no event shall we be liable for any indirect, incidental, special, or consequential damages.`,
      },
      {
        heading: "8. Indemnification",
        content: `You agree to indemnify and hold harmless Englivo and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the service or your violation of these Terms.`,
      },
      {
        heading: "9. Changes to Terms",
        content: `We may update these Terms of Service from time to time. We will notify you of significant changes by posting the new terms on this page and updating the "Effective Date" at the top. Your continued use of Englivo after such changes constitutes acceptance of the new terms.`,
      },
      {
        heading: "10. Contact Us",
        content: `For any questions regarding these Terms of Service, please reach out to:

Email: support@englivo.com
Website: https://englivo.com/contact`,
      },
    ],
  },
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const content = termsContent.en;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-electric/30 selection:text-electric-foreground relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-electric/5 rounded-full blur-[120px] opacity-30" />
      </div>

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-32 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 font-serif">
          {content.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          {content.effectiveDate}
        </p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl leading-relaxed mb-12">{content.intro}</p>

          {content.sections.map((section, index) => (
            <section key={index} className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {section.heading}
              </h2>
              <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
