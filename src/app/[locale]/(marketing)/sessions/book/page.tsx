"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import {
  Loader2,
  Calendar,
  Clock,
  ArrowLeft,
  Zap,
  AlertCircle,
  ArrowRight,
  Mic,
  Brain,
  Users,
  Target,
  LineChart,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addHours, startOfHour, addDays, isSameDay } from 'date-fns';

export default function BookSessionPage() {
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const router = useRouter();

  // Generate mock time slots for the next 3 days
  const timeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    const start = addHours(startOfHour(now), 1); // Start from next hour

    for (let d = 0; d < 3; d++) {
      const day = addDays(start, d);
      const daySlots = [];
      // 9 AM to 9 PM
      for (let h = 9; h <= 21; h++) {
        const slot = new Date(day);
        slot.setHours(h, 0, 0, 0);
        if (slot > now) {
          daySlots.push(slot);
        }
      }
      if (daySlots.length > 0) {
        slots.push({
          date: day,
          slots: daySlots
        });
      }
    }
    return slots;
  }, []);

  const { isSignedIn } = useUser();

  async function submit() {
    if (!selectedTime) return;

    // Client-side auth check
    if (!isSignedIn) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/sign-in?redirect_url=${returnUrl}`);
      return;
    }

    setLoading(true);
    setError(null);

    // Default duration: 1 hour
    const end = new Date(selectedTime.getTime() + 60 * 60 * 1000);

    try {
      const res = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: selectedTime.toISOString(),
          endTime: end.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setBookingSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setBookingSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 dark:bg-indigo-600 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-400 dark:bg-blue-800 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-8 md:py-16 px-4">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
              <ArrowLeft size={16} />
            </div>
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight font-serif">
            Your Next Breakthrough in English <span className="text-blue-600 dark:text-blue-400">Starts Here</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Book a private speaking session designed around how you actually talk. Real feedback, real growth.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Value & Trust */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-indigo-500/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />

              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-slate-900 dark:text-white">
                Our 1-on-1 Coaching Session
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 border-l-4 border-blue-500 pl-4 py-1 italic">
                “60 minutes of real speaking, guided by AI and a human expert.”
              </p>

              <div className="space-y-6 mb-10">
                <FeatureItem icon={<Users className="w-5 h-5" />} title="Live speaking practice" desc="Real conversation, not scripted exercises" color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
                <FeatureItem icon={<Brain className="w-5 h-5" />} title="AI-powered feedback" desc="We detect hesitation, grammar and confidence" color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
                <FeatureItem icon={<Mic className="w-5 h-5" />} title="Human expert guidance" desc="A real coach supports your growth" color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                <FeatureItem icon={<LineChart className="w-5 h-5" />} title="Personal fluency report" desc="You receive your score and practice plan" color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">What You'll Improve</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Pronunciation', 'Confidence', 'Hesitation', 'Real-life conversation', 'Grammar in Context'].map(pill => (
                      <span key={pill} className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors hover:border-blue-300 dark:hover:border-blue-700">
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">Included After Session</h3>
                  <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {['Fluency Score', 'Mistake Breakdown', 'Daily Drills', 'Progress Tracking'].map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Booking Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7"
          >
            <AnimatePresence mode="wait">
              {bookingSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-12 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/30 text-center shadow-2xl shadow-emerald-500/10"
                >
                  <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20 rotate-3">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Booking Confirmed!</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm mx-auto">
                    Your session has been reserved. Prepare to take your English to the next level.
                  </p>

                  <div className="max-w-xs mx-auto mb-8">
                    <ConfidenceMeter label="Pre-session hype" initialLevel={0.4} />
                  </div>

                  <p className="text-sm text-slate-400 animate-pulse">Redirecting you in a moment...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  className="p-8 md:p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-blue-500/5 relative"
                >
                  <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Choose Your Session Time</h2>
                    <p className="text-slate-500 dark:text-slate-400">Pick a time that works for you. Sessions fill quickly.</p>
                  </div>

                  <div className="space-y-10">
                    {/* Time Selection Slots */}
                    <div className="space-y-8">
                      {timeSlots.map((dayGroup, idx) => (
                        <div key={idx} className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {isSameDay(dayGroup.date, new Date()) ? 'Today' : format(dayGroup.date, 'EEEE, MMM do')}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {dayGroup.slots.map((slot, sIdx) => {
                              const isSelected = selectedTime?.getTime() === slot.getTime();
                              const isRecommended = slot.getHours() === 10 || slot.getHours() === 14;

                              return (
                                <button
                                  key={sIdx}
                                  onClick={() => {
                                    setError(null);
                                    setSelectedTime(slot);
                                  }}
                                  className={`relative group p-4 rounded-2xl border-2 transition-all duration-200 text-center ${isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10'
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200'
                                    }`}
                                >
                                  {isRecommended && !isSelected && (
                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter bg-amber-400 text-amber-950 shadow-sm z-10">
                                      Rec.
                                    </span>
                                  )}
                                  <span className="text-lg font-bold">{format(slot, 'h:mm')}</span>
                                  <span className="block text-[10px] font-semibold opacity-60 uppercase">{format(slot, 'a')}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Booking Summary Card */}
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Zap size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Session</p>
                          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold">
                            <span>60 min</span>
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                            <span>1 Credit</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Coach</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">AI-assisted expert</p>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 text-sm font-medium"
                      >
                        <AlertCircle className="shrink-0 h-5 w-5" />
                        {error}
                      </motion.div>
                    )}

                    {/* CTA Section */}
                    <div className="space-y-4">
                      <motion.button
                        whileHover={!loading && selectedTime ? { scale: 1.01 } : {}}
                        whileTap={!loading && selectedTime ? { scale: 0.98 } : {}}
                        onClick={submit}
                        disabled={loading || !selectedTime}
                        className={`w-full py-5 px-8 rounded-2.5xl text-xl font-bold transition-all relative overflow-hidden flex items-center justify-center gap-3 group ${loading || !selectedTime
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/20 active:shadow-none'
                          }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Reserving...
                          </>
                        ) : (
                          <>
                            Reserve My Session
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                        {!loading && selectedTime && (
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </motion.button>

                      <p className="text-center text-xs text-slate-400 font-medium">
                        Cancel or reschedule anytime up to 24 hours before. No penalty.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Mobile Sticky Placeholder (Actual logic for fixed button at bottom could go here for tiny screens) */}
    </div>
  );
}

function FeatureItem({ icon, title, desc, color, bg }: { icon: React.ReactNode, title: string, desc: string, color: string, bg: string }) {
  return (
    <div className="flex gap-4">
      <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 ${bg} ${color} shadow-sm border border-black/5 dark:border-white/5`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}