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
    return <AITutorClient />;
}
