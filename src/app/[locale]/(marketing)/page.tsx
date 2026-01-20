import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { getDictionary, type Locale } from '@/i18n/getDictionary';
import { currentUser } from '@clerk/nextjs/server';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import dynamic from 'next/dynamic';

const DynamicText = dynamic(() => import('@/components/ui/dynamic-text'));
const FAQSection = dynamic(() => import('@/components/FAQSection').then(mod => mod.FAQSection));
const SpeakingMomentsGrid = dynamic(() => import('@/components/SpeakingMomentsGrid').then(mod => mod.SpeakingMomentsGrid));
const FloatingConversation = dynamic(() => import('@/components/FloatingConversation').then(mod => mod.FloatingConversation));
const TutorCard = dynamic(() => import('@/components/TutorCard').then(mod => mod.TutorCard));
const IntermediatePlateau = dynamic(() => import('@/components/IntermediatePlateau').then(mod => mod.IntermediatePlateau));
const DailyRoutine = dynamic(() => import('@/components/DailyRoutine').then(mod => mod.DailyRoutine));
const AITutorButton = dynamic(() => import('@/components/AITutorButton').then(mod => mod.AITutorButton));
const FluencyMirror = dynamic(() => import('@/components/FluencyMirror').then(mod => mod.FluencyMirror));
const SituationalGateway = dynamic(() => import('@/components/SituationalGateway').then(mod => mod.SituationalGateway));
const FluencyReflexSection = dynamic(() => import('@/components/FluencyReflexSection').then(mod => mod.FluencyReflexSection));
const TestimonialsCarousel = dynamic(() => import('@/components/TestimonialsCarousel').then(mod => mod.TestimonialsCarousel));
const AudioTransformation = dynamic(() => import('@/components/AudioTransformation').then(mod => mod.AudioTransformation));
const FluencyEngineShowcase = dynamic(() => import('@/components/FluencyEngineShowcase').then(mod => mod.FluencyEngineShowcase));
const FluencyGlobe = dynamic(() => import('@/components/FluencyGlobe').then(mod => mod.FluencyGlobe));
const LiveNowBanner = dynamic(() => import('@/components/LiveNowBanner').then(mod => mod.LiveNowBanner));
const CEFRJourney = dynamic(() => import('@/components/home/CEFRJourney').then(mod => mod.CEFRJourney));
const MicroHeadlines = dynamic(() => import('@/components/MicroHeadlines').then(mod => mod.MicroHeadlines));


const tutors = [
  { name: "Sarah J.", specialty: "Business English", style: "Former HR Director. Helps you navigate interviews and presentations." },
  { name: "David L.", specialty: "Conversation Fluency", style: "Casual, supportive chats that help you find your natural rhythm." },
  { name: "Elena R.", specialty: "Academic Writing", style: "Precise and structured. Perfect for thesis defense or exam preparation." },
  { name: "Michael C.", specialty: "Accent Reduction", style: "Phonetics expert. Helps you hear the sounds you are missing." },
];

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  let user = null;
  try {
    user = await currentUser();
  } catch (err) {
    console.error("Clerk currentUser() failed:", err);
    // Continue as logged out user
  }

  const isLoggedIn = !!user;

  const t = dict;

  // Clean headline for Text Effect (remove HTML tags)
  const headlineText = t.hero.headline.replace(/<[^>]*>/g, ' ');

  // FAQ Schema
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.faq.items.map((item: any) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-electric/30 selection:text-electric-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FloatingConversation />

      {/* AI Tutor Floating Button */}
      <AITutorButton isLoggedIn={isLoggedIn} locale={locale} />

      <main className="relative z-10">
        {/* 1. HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
          {/* Abstract background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-electric/10 rounded-full blur-[120px] pointer-events-none opacity-50" />


          <div className="w-full max-w-7xl mx-auto text-center relative z-10 glass-card p-8 md:p-12 rounded-3xl bg-background/20 backdrop-blur-md border border-white/10 shadow-2xl">

            <div className="mb-4 flex justify-center">
              <DynamicText />
            </div>

            <div className="mb-8 relative">
              <h1 className="sr-only">{headlineText}</h1>
              <div aria-hidden="true">
                <TextGenerateEffect
                  words={headlineText}
                  className="font-serif text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] text-foreground text-center"
                />
              </div>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 font-light">
              {t.hero.subtext}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={isLoggedIn ? `/${locale}/practice` : `/${locale}/sign-in`}>
                <Button size="lg" className="rounded-full bg-electric hover:bg-electric/90 text-white font-medium px-8 h-12 text-base shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-105">
                  {t.hero.ctaReflection}
                </Button>
              </Link>
              <Link href={`/${locale}/fluency-guide`}>
                <Button variant="ghost" size="lg" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/10 px-8 h-12 text-base">
                  Explore Fluency Guide →
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 1.2 LIVE NOW BANNER */}
        <LiveNowBanner locale={locale} />

        {/* 1.3 MICRO-HEADLINES (Pillar + Problem/Solution) */}
        <MicroHeadlines locale={locale} />

        {/* 1.5 FLUENCY ENGINE (Sticky Scroll Reveal) */}
        <FluencyReflexSection dict={t.fluencyEngine} />

        {/* 2. THE FLUENCY MIRROR (Unified Activity) */}
        <section id="practice">
          <FluencyMirror />
        </section>

        {/* 2.0 CEFR JOURNEY (Aspirational Prestige Ladder) */}
        <CEFRJourney dict={t.cefrJourney} locale={locale} />

        <SituationalGateway dict={t.situationalGateway} isLoggedIn={isLoggedIn} />

        {/* 2.75 FLUENCY GLOBE (Global Context) */}
        <FluencyGlobe dict={t.fluencyGlobe} />



        {/* 3. SPEAKING MOMENTS (Empathy Grid) */}
        <SpeakingMomentsGrid dict={t.speakingMoments} />

        {/* 3.5 THEORY (The Why) */}
        <IntermediatePlateau dict={t.intermediatePlateau} />

        {/* 4. THE INTERMEDIATE PLATEAU (Education) -> Renaming ID/Section or Keeping as "Approach" */}
        <section id="approach" className="py-24 border-t border-border">
          {/* ... existing content from Approach? Actually page.tsx line 81 was empty! */}
          {/* It said { /* ... existing content ... * / }. I will leave it empty as placeholder or just assume IntermediatePlateau *IS* the approach visual now? */}
          {/* Providing content for Approach section if it was empty? The previous view_file showed it empty with comments. */}
          {/* I will Insert DailyRoutine here as the practical method */}
          <DailyRoutine dict={t.dailyRoutine} />
        </section>

        {/* 4.5 TRANSFORMATION (The Result) */}
        <AudioTransformation dict={t.audioTransformation} />

        {/* 4.6 FLUENCY ENGINE SHOWCASE (New Section) */}
        <FluencyEngineShowcase dict={t.fluencyShowcase} />

        {/* 5. IMPACT STORIES (Social Proof) */}
        <TestimonialsCarousel
          stories={t.testimonials.stories}
          headline={t.testimonials.headline}
          subtext={t.testimonials.subtext}
        />

        {/* 6. THE FACULTY (Bento Grid) */}
        <section id="tutors" className="py-24 bg-muted/20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl mb-4 text-foreground">{t.tutors.headline}</h2>
                <p className="text-muted-foreground max-w-xl">{t.tutors.subtext}</p>
              </div>
              <Link href={`/${locale}/tutors`} className="text-electric hover:text-electric/80 transition-colors flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
                {t.tutors.viewAll} <ArrowRight size={16} />
              </Link>
            </div>

            {/* Simulated Bento Layout by varying sizes in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <TutorCard {...tutors[0]} />
              </div>
              <div>
                <TutorCard {...tutors[1]} />
              </div>
              <div>
                <TutorCard {...tutors[2]} />
              </div>
              <div className="md:col-span-2">
                <TutorCard {...tutors[3]} />
              </div>
            </div>
          </div>
        </section>

        {/* 6. THE ROADMAP (Process) with Vertical Line */}
        <section id="method" className="py-32 bg-background relative overflow-hidden">

          <div className="container mx-auto px-6 max-w-4xl relative z-10">
            <div className="text-center mb-24">
              <h2 className="font-serif text-3xl md:text-5xl mb-6">{t.roadmap.headline}</h2>
            </div>

            <div className="relative">
              {/* The Path (Vertical Line) */}
              <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-electric/30 to-transparent -translate-x-1/2">
                <div
                  className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-electric to-transparent w-[2px] -translate-x-[0.5px] blur-[1px] animate-[pulse_3s_ease-in-out_infinite]"
                // Replaced motion.div with standard div and tailwind animation/class to avoid client-side animation sync issues in RSC or keep it simple.
                // Or assume global CSS handles pulse.
                />
              </div>

              {[
                { step: "01", title: t.roadmap.audit.title, desc: t.roadmap.audit.desc },
                { step: "02", title: t.roadmap.plan.title, desc: t.roadmap.plan.desc },
                { step: "03", title: t.roadmap.immersion.title, desc: t.roadmap.immersion.desc }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col md:flex-row items-center gap-8 mb-20 relative ${idx % 2 === 0 ? 'md:flex-row-reverse text-left md:text-left' : 'text-left md:text-right'}`}
                // Removed motion.div for server component simplicity or keeping framer requires client component.
                // BUT 'Home' is a Server Component. It can't render motion.div directly?
                // Wait, motion.div works in Server Components? NO. It renders as normal div but animation is client side?
                // The original page.tsx was 'use client'!
                // Line 1: 'use client'; in original file.
                // I REMOVED 'use client' because I need 'await params' and 'getDictionary'.
                // THIS IS A CONFLICT.
                // I MUST split the Client parts into a Client Component.
                >
                  <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                    <h3 className="text-2xl font-serif text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="w-[60px] flex justify-center z-10 relative">
                    <div className="w-16 h-16 rounded-full bg-background border border-electric flex items-center justify-center font-serif text-xl text-electric shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      {item.step}
                    </div>
                  </div>

                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* 8. METHODOLOGY FAQ */}
        <FAQSection content={t.faq} />

        {/* 9. FINAL CTA */}
        <section className="py-32 flex justify-center text-center px-6">
          <div className="max-w-3xl">
            <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight">{t.ctaBottom.headline}</h2>
            <div className="flex flex-col gap-6 items-center">
              <Link href={isLoggedIn ? `/${locale}/book/session` : `/${locale}/sign-in`}>
                <Button size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium px-12 h-16 text-lg tracking-wide shadow-2xl">
                  {t.ctaBottom.button}
                </Button>
              </Link>
              <p className="text-muted-foreground text-sm">{t.ctaBottom.guarantee}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}