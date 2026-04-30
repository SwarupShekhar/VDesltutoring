import type { Metadata } from 'next';
import { constructCanonicalMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/getDictionary';
import AITutorClient from './AITutorClient';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
    const { locale } = await params;
    return {
        ...constructCanonicalMetadata('/ai-tutor', locale),
        title: 'AI English Tutor | Englivo',
        description: 'Practice speaking English with an AI tutor. Get real-time fluency feedback, grammar corrections, and CEFR-level coaching — no judgment, just practice.',
    };
}

export default function AITutorPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Englivo AI English Tutor',
        url: 'https://englivo.com/ai-tutor',
        description: 'An AI-powered conversational English tutor that gives real-time fluency feedback, grammar corrections, and CEFR-level coaching through voice practice sessions.',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Static content indexed by search engines.
                Describes the page accurately and is always present in the HTML.
                The client component overlays this once JS loads. */}
            <div className="sr-only">
                <h1>AI English Tutor — Practice Speaking English</h1>
                <p>
                    Englivo&apos;s AI English Tutor is a voice-based conversational practice tool that
                    listens to you speak, provides real-time grammar corrections, fluency scoring, and
                    CEFR-level feedback. No judgment — just practice at your own pace.
                </p>
                <h2>What you get</h2>
                <ul>
                    <li>Real-time spoken English feedback powered by AI</li>
                    <li>Grammar and vocabulary corrections after each response</li>
                    <li>CEFR-aligned fluency scoring (A2 through C1)</li>
                    <li>Challenge mode: a strict examiner session to test your level</li>
                    <li>Session report with fluency insights and next steps</li>
                </ul>
                <h2>How it works</h2>
                <p>
                    Start a conversation, speak naturally, and the AI tutor responds in real time.
                    After your session, receive a detailed report on your speaking fluency, common
                    errors, and personalised recommendations to improve.
                </p>
            </div>
            <AITutorClient />
        </>
    );
}
