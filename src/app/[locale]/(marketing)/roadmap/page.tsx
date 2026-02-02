import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { getDictionary, type Locale } from '@/i18n/getDictionary';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    return {
        title: "Product Roadmap | Englivo",
        description: "Explore the future of English fluency. See what we're building to help you speak more naturally and confidently.",
    };
}

export default async function RoadmapPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    const roadmapItems = [
        {
            stage: "Recently Released",
            status: "completed",
            items: [
                "AI-Powered Speaking Practice",
                "CEFR-Based Fluency Feedback",
                "Live Tutor Matching System",
                "Mobile App Beta (Android)"
            ]
        },
        {
            stage: "Developing Now",
            status: "in-progress",
            items: [
                "Word of the Day Archive (Public)",
                "Weekly Fluency Insights",
                "Advanced CEFR Assessment Gates",
                "Interactive Grammar Scaffolding"
            ]
        },
        {
            stage: "Future Vision",
            status: "planned",
            items: [
                "Global Practice Communities",
                "Corporate Training Dashboards",
                "iOS Professional App",
                "Industry-Specific Vocabulary Modules"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground py-24 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href={locale === 'en' ? '/' : `/${locale}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <h1 className="font-serif text-4xl md:text-6xl mb-6">Product Roadmap</h1>
                <p className="text-xl text-muted-foreground mb-16 max-w-2xl">
                    We're building the most authoritative, data-driven platform for English fluency. Here's where we've been and where we're going.
                </p>

                <div className="space-y-16">
                    {roadmapItems.map((section, idx) => (
                        <div key={idx} className="relative">
                            <h2 className={`text-sm font-bold tracking-widest uppercase mb-8 ${section.status === 'completed' ? 'text-electric' :
                                    section.status === 'in-progress' ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                {section.stage}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.items.map((item, i) => (
                                    <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5 flex items-start gap-4">
                                        {section.status === 'completed' ? (
                                            <CheckCircle2 className="text-electric shrink-0" size={20} />
                                        ) : section.status === 'in-progress' ? (
                                            <div className="w-5 h-5 rounded-full border-2 border-electric shrink-0 animate-pulse" />
                                        ) : (
                                            <Circle className="text-muted-foreground shrink-0" size={20} />
                                        )}
                                        <span className="font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-24 p-12 rounded-3xl bg-electric/10 border border-electric/20 text-center">
                    <h3 className="text-2xl font-serif mb-4">Want to influence our roadmap?</h3>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        We build for our community of professionals. Join us and help shape the future of language learning.
                    </p>
                    <Link href={locale === 'en' ? '/sign-up' : `/${locale}/sign-up`}>
                        <Button size="lg" className="rounded-full">Get Started Today</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
