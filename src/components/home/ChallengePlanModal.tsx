'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { scenarioList, type SpeakingScenario } from '@/lib/scenarios';
import { trackEvent } from '@/lib/analytics';
import Link from 'next/link';

const SESSION_STORAGE_KEY = 'englivo_challenge_modal_shown';
const BLOB_STORAGE_KEY = 'englivo_challenge_blob_visible';

interface ChallengePlanModalProps {
  locale: string;
  isLoggedIn: boolean;
}

type Step = 'SELECT' | 'PREVIEW';

export function ChallengePlanModal({ locale, isLoggedIn }: ChallengePlanModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('SELECT');
  const [selectedScenario, setSelectedScenario] = useState<SpeakingScenario | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const openModalOnce = useCallback(() => {
    if (hasTriggered || typeof window === 'undefined') return;
    try {
      if (window.sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true') return;
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    } catch {
      // ignore storage failures
    }
    setHasTriggered(true);
    setIsOpen(true);
    trackEvent('modal_shown');
  }, [hasTriggered]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Restore minimized blob state across navigations
    try {
      const blobVisible = window.localStorage.getItem(BLOB_STORAGE_KEY) === 'true';
      if (blobVisible) {
        setIsMinimized(true);
      }
    } catch {
      // ignore storage failures
    }

    // Time-based trigger (4s)
    const timeoutId = window.setTimeout(() => {
      openModalOnce();
    }, 4000);

    // Scroll / hero visibility trigger
    const hero = document.getElementById('hero');
    let observer: IntersectionObserver | null = null;

    if (hero && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        entries => {
          const entry = entries[0];
          if (!entry.isIntersecting) {
            openModalOnce();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(hero);
    }

    return () => {
      window.clearTimeout(timeoutId);
      if (observer && hero) {
        observer.unobserve(hero);
      }
    };
  }, [openModalOnce]);

  const close = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleSkip = () => {
    setIsOpen(false);
    setIsMinimized(true);
    trackEvent('skip_clicked');
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(BLOB_STORAGE_KEY, 'true');
      }
    } catch {
      // ignore storage failures
    }
  };

  const handleScenarioClick = (scenario: SpeakingScenario) => {
    setSelectedScenario(scenario);
    setStep('PREVIEW');
    trackEvent('scenario_selected', { scenario: scenario.slug });
  };

  const planHrefForLocale = (slug: string) => {
    if (locale === 'en') return `/plan/${slug}`;
    return `/${locale}/plan/${slug}`;
  };

  const handlePlanCtaClick = (scenario: SpeakingScenario, action: 'start' | 'full') => {
    trackEvent('plan_cta_clicked', {
      scenario: scenario.slug,
      action,
    });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="challenge-plan-modal-title"
          >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="relative w-full max-h-[90vh] sm:max-h-[80vh] sm:max-w-xl bg-card/95 glass-card border border-border dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors dark:bg-black/60 dark:hover:bg-black"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6 overflow-y-auto">
              {step === 'SELECT' && (
                <div className="space-y-6">
                  <div>
                    <h2
                      id="challenge-plan-modal-title"
                      className="text-xl sm:text-2xl font-semibold font-serif mb-2"
                    >
                      What&apos;s holding your English back right now?
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Choose your challenge and we will show you your 30 day path.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {scenarioList.map((scenario) => (
                      <button
                        key={scenario.slug}
                        onClick={() => handleScenarioClick(scenario)}
                        className="group flex flex-col items-start gap-2 rounded-2xl border border-border dark:border-white/10 bg-card/95 dark:bg-slate-900/80 px-4 py-3 sm:px-5 sm:py-4 text-left hover:border-electric/60 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <span className="text-lg">{scenario.emoji}</span>
                          <span>{scenario.cardTitle}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {scenario.cardSubtitle}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-electric">
                          View 30-day path
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 'PREVIEW' && selectedScenario && (
                <div className="space-y-5">
                  <button
                    onClick={() => setStep('SELECT')}
                    className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground mb-1"
                  >
                    ← Choose a different challenge
                  </button>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-electric flex items-center gap-1">
                      <span className="text-base">{selectedScenario.emoji}</span>
                      Personalized 30-day speaking track
                    </p>
                    <h2 className="text-xl sm:text-2xl font-semibold font-serif">
                      {selectedScenario.miniHero}
                    </h2>
                  </div>

                  {/* Week overview */}
                  <div className="rounded-2xl bg-muted/80 dark:bg-slate-900/80 border border-border dark:border-white/10 p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      4-week flow
                    </p>
                    <div className="flex flex-col gap-2 text-xs sm:text-[13px] text-foreground dark:text-slate-200">
                      {selectedScenario.weekThemes.map((label, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="mt-[3px] h-1.5 w-1.5 rounded-full bg-electric" />
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outcomes */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      After 30 days, you will:
                    </p>
                    <ul className="space-y-2">
                      {selectedScenario.outcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-foreground dark:text-slate-200">
                          <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-400 flex-shrink-0" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-2 pt-2">
                    <Link
                      href={planHrefForLocale(selectedScenario.slug)}
                      onClick={() => handlePlanCtaClick(selectedScenario, 'start')}
                      className="inline-flex w-full items-center justify-center rounded-full bg-electric text-white px-4 py-3 text-sm font-medium shadow-lg hover:bg-blue-500 transition-colors"
                    >
                      Start my {selectedScenario.cardTitle.replace("I ", "")} plan →
                    </Link>

                    <Link
                      href={planHrefForLocale(selectedScenario.slug)}
                      onClick={() => handlePlanCtaClick(selectedScenario, 'full')}
                      className="block text-center text-xs sm:text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                    >
                      See full plan details
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Footer skip link */}
            <div className="border-t border-border dark:border-white/5 px-6 py-3 sm:px-8 sm:py-4 flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground bg-muted/80 dark:bg-black/40">
              <span>We&apos;ll only show this once per session.</span>
              <button
                onClick={handleSkip}
                className="underline underline-offset-4 hover:text-foreground"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </div>
        )}
      </AnimatePresence>

      {/* Minimized blob after skip */}
      <AnimatePresence>
        {isMinimized && (
          <motion.button
            type="button"
            aria-label="Englivo plan helper"
            onClick={() => {
              setIsOpen(true);
              trackEvent('blob_clicked');
            }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed left-4 bottom-6 z-[120] h-16 w-16 rounded-full bg-electric shadow-xl flex items-center justify-center text-white border border-white/70 dark:border-white/40 ${
              isLoggedIn ? '' : 'animate-bounce'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-white/90 animate-bounce [animation-delay:-0.2s]" />
              <span className="h-3 w-3 rounded-full bg-white/90 animate-bounce" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/90 animate-bounce [animation-delay:0.2s]" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

