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
    ...constructCanonicalMetadata("/privacy", locale),
    title: 'Privacy Policy | Englivo English Fluency Platform',
    description: 'Learn how Englivo securely handles, encrypts, and protects your account information, speaking recordings, and learning metrics in our privacy policy.',
  };
}

const privacyContent = {
  en: {
    title: "Privacy Policy",
    effectiveDate: "Effective Date: March 10, 2026",
    intro:
      "Welcome to Englivo (https://englivo.com). Your privacy is critically important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our English fluency platform.",
    sections: [
      {
        heading: "1. Information We Collect",
        content: `We collect information necessary to provide a high-quality learning experience:

Account Information: Personal identifiers such as your name, email address, and profile data provided during registration.
Learning & Audio Data: We process text and voice inputs from your practice sessions to provide AI-driven fluency feedback and progress tracking.
Payment Information: Financial transactions are handled by secure, PCI-compliant third-party payment processors. We do not store full credit card numbers or sensitive banking credentials on our systems.
Technical Logs: Standard usage data including IP addresses, browser types, and device identifiers to ensure platform security and performance.`,
      },
      {
        heading: "2. How We Use Your Information",
        content: `Your data is used to:
Provide Services: Manage your account and personalize your English learning path.
Improve AI Accuracy: Enhance our speech recognition and feedback algorithms.
Support: Respond to your inquiries and send essential account updates.
Security: Prevent fraudulent activity and protect our users.`,
      },
      {
        heading: "3. Data Sharing & Third Parties",
        content: `We do not sell your personal data. We only share information with service providers who help us operate our platform, including:
Identity Management: Secure third-party providers for user authentication and login.
Payment Processing: Trusted financial gateways for secure billing.
Cloud Infrastructure: Industry-standard hosting and database providers.
AI Processing: Secure specialized services used to analyze language patterns and provide feedback.`,
      },
      {
        heading: "4. Data Retention & Security",
        content: `We retain your information only as long as necessary to provide our services or comply with legal obligations. We use industry-standard encryption (SSL/TLS) to protect data during transmission. While we strive to protect your personal information, no method of electronic storage is 100% secure.`,
      },
      {
        heading: "5. Your Privacy Rights",
        content: `Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. You may also withdraw your consent for data processing at any time by contacting us.`,
      },
      {
        heading: "6. Cookies",
        content: `We use essential cookies to maintain your session and remember your preferences. You can manage cookie settings through your browser, though some features of Englivo may be limited as a result.`,
      },
      {
        heading: "7. Changes to This Policy",
        content: `We may update this policy periodically. We will notify you of significant changes by updating the "Effective Date" at the top of this page.`,
      },
      {
        heading: "8. Contact Us",
        content: `For any questions regarding this policy, please reach out to:

Email: support@englivo.com
Website: https://englivo.com/contact`,
      },
    ],
  },
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const content = privacyContent.en;

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
