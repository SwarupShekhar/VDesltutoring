import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Locale } from '@/i18n/getDictionary';
import { getScenarioBySlug, type ScenarioSlug } from '@/lib/scenarios';

interface PlanPageProps {
  params: Promise<{ locale: Locale; slug: ScenarioSlug }>;
}

export async function generateMetadata(
  props: PlanPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const scenario = getScenarioBySlug(slug);

  if (!scenario) {
    return {
      title: 'Englivo Plan',
    };
  }

  return {
    title: `${scenario.pageHeroTitle} | Englivo`,
    description: scenario.pageHeroSubtitle,
  };
}

export default async function PlanPage(props: PlanPageProps) {
  const { locale, slug } = await props.params;
  const scenario = getScenarioBySlug(slug);

  if (!scenario) {
    notFound();
  }

  const pricingHref = locale === 'en' ? '/pricing' : `/${locale}/pricing`;
  const signInHref = locale === 'en' ? '/sign-in' : `/${locale}/sign-in`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="relative py-16 md:py-24 px-6">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-blue-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-400/10 blur-3xl rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto space-y-16">
          {/* 1. Hero */}
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border dark:border-white/15 bg-muted/70 dark:bg-black/40 px-3 py-1 text-xs text-muted-foreground">
              <span className="text-lg">{scenario.emoji}</span>
              <span>Englivo 30-day track</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold">
                {scenario.pageHeroTitle}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
                {scenario.pageHeroSubtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href={pricingHref}>
                <Button size="lg" className="rounded-full px-7">
                  Start this plan with Englivo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={signInHref} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
                Already a member? Sign in
              </Link>
            </div>
          </section>

          {/* 2. If this sounds like you */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif">If this sounds like you</h2>
            <div className="glass-card rounded-3xl border border-border dark:border-white/10 bg-card/90 dark:bg-black/40 px-6 py-6 md:px-8 md:py-7">
              <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
                {scenario.painPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-electric flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 3. 30-Day Improvement Plan */}
          <section className="space-y-6">
            <h2 className="text-2xl font-serif">Your 30-day improvement plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {scenario.weekDetails.map((week, index) => (
                <div
                  key={week.title}
                  className="glass-card rounded-2xl border border-border dark:border-white/10 bg-card/90 dark:bg-slate-950/60 px-5 py-5 flex flex-col gap-2"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Week {index + 1}
                  </p>
                  <h3 className="text-base md:text-lg font-semibold">
                    {week.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {week.summary}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Outcomes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif">What changes in 30 days</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenario.pageOutcomes.map((outcome, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border dark:border-white/10 bg-card/90 dark:bg-slate-950/60 px-5 py-4 flex items-start gap-3"
                >
                  <CheckCircle2 className="mt-[2px] h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <p className="text-sm md:text-base text-foreground dark:text-slate-100">
                    {outcome}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. How it works */}
          <section className="space-y-5">
            <h2 className="text-2xl font-serif">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  label: 'Step 1',
                  title: 'Choose your track',
                  desc: 'Pick the speaking challenge that matches where you feel most stuck right now.',
                },
                {
                  label: 'Step 2',
                  title: 'Get your fluency audit',
                  desc: 'Englivo analyzes your speaking and identifies the exact bottlenecks to work on.',
                },
                {
                  label: 'Step 3',
                  title: 'Follow your 30-day plan',
                  desc: 'Combine AI practice, live coaching, and short drills that fit into your week.',
                },
              ].map((step, index) => (
                <div
                  key={step.label}
                  className="glass-card rounded-2xl border border-border dark:border-white/10 bg-card/90 dark:bg-slate-950/60 px-5 py-5 flex flex-col gap-2"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-electric">
                    {step.label}
                  </p>
                  <h3 className="text-base md:text-lg font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.desc}
                  </p>
                  {index < 2 && (
                    <div className="mt-2 h-px w-12 bg-gradient-to-r from-electric/60 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 6. Final CTA */}
          <section className="space-y-4 pb-8">
            <div className="glass-card rounded-3xl border border-border dark:border-white/10 bg-card/95 dark:bg-black/60 px-6 py-7 md:px-8 md:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-serif">
                  Ready to start your {scenario.cardTitle.toLowerCase()} plan?
                </h2>
                <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                  Get access to your track, real-time feedback, and live coaching that matches your exact speaking bottleneck.
                </p>
              </div>
              <div className="flex flex-col gap-2 md:items-end">
                <Link href={pricingHref}>
                  <Button size="lg" className="rounded-full px-7 w-full md:w-auto">
                    View plans &amp; pricing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={signInHref}
                  className="text-xs md:text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 text-center md:text-right"
                >
                  Already learning with Englivo? Continue your track
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

