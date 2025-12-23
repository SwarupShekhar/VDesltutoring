import { HomeNavbar } from '@/components/HomeNavbar';
import { getDictionary, type Locale } from '@/i18n/getDictionary';

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    return (
        <div className="min-h-screen bg-background text-foreground">
            <HomeNavbar dict={dict.nav} locale={locale} />
            <main className="container mx-auto px-6 py-32 max-w-3xl">
                <h1 className="font-serif text-5xl md:text-6xl mb-12">About Natural Flow</h1>

                <div className="space-y-8 text-lg text-muted-foreground leading-relaxed font-light">
                    <p>
                        <strong className="text-foreground">We are linguists, actors, and executives.</strong> We built Natural Flow because we saw brilliant professionals shrinking in English-speaking rooms.
                    </p>
                    <p>
                        The traditional ESL industry treats language like math: memorize the rules, and you'll get the answer. But speaking isn't math. It's music. It's rhythm, timing, and confidence.
                    </p>
                    <p>
                        Our methodology is based on "Interactive Empathy"—the science of how human connection overrides performance anxiety. We don't just teach you words; we teach you how to hold space.
                    </p>
                </div>
            </main>
        </div>
    );
}
