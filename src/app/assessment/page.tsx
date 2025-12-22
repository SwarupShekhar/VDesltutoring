import { HomeNavbar } from '@/components/HomeNavbar';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AssessmentPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <HomeNavbar />
            <main className="container mx-auto px-6 py-32 max-w-3xl text-center">
                <div className="w-16 h-16 bg-electric/10 rounded-full flex items-center justify-center mx-auto mb-8 text-electric">
                    <div className="w-3 h-3 bg-electric rounded-full animate-pulse" />
                </div>

                <h1 className="font-serif text-4xl md:text-5xl mb-6">Fluency Assessment</h1>
                <p className="text-xl text-muted-foreground leading-relaxed mb-12">
                    We are preparing your personalized diagnostic environment.
                    This assessment will analyze your hesitation patterns and create your custom roadmap.
                </p>

                <div className="inline-flex flex-col items-center gap-4">
                    <Button size="lg" className="rounded-full px-8 bg-electric text-white shadow-lg" disabled>
                        Assessment Module Loading...
                    </Button>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Available Soon</p>
                </div>
            </main>
        </div>
    );
}
