import type { Metadata } from 'next';
import { constructCanonicalMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/getDictionary';
import Link from 'next/link';
import AITutorLoader from './AITutorLoader';

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
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Landing section — rendered server-side, always visible.
                AITutorClient mounts over this once JS loads. */}
            <div id="ai-tutor-landing" className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-32">
                <div className="max-w-2xl mx-auto text-center space-y-8">
                    <h1 className="text-5xl md:text-6xl font-bold font-serif text-white leading-tight">
                        AI English Tutor
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Practice speaking English with an AI conversation partner.
                        Get real-time fluency feedback, grammar corrections, and
                        CEFR-level coaching — no judgment, just practice.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-400 pt-4">
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                            <div className="text-2xl mb-2">🎤</div>
                            <div className="font-semibold text-white mb-1">Voice Practice</div>
                            <div>Speak naturally — the AI listens and responds in real time</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                            <div className="text-2xl mb-2">📊</div>
                            <div className="font-semibold text-white mb-1">Fluency Feedback</div>
                            <div>Grammar corrections and CEFR scoring after every session</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                            <div className="text-2xl mb-2">🏆</div>
                            <div className="font-semibold text-white mb-1">Challenge Mode</div>
                            <div>Strict examiner sessions to test and certify your level</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link
                            href="/sign-up"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-lg transition-colors"
                        >
                            Start Practising Free
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold text-lg transition-colors"
                        >
                            How It Works
                        </Link>
                    </div>
                </div>
            </div>

            {/* Interactive session — mounts client-side and takes over the page */}
            <AITutorLoader />
        </>
    );
}
