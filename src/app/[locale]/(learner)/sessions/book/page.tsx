'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';

import { Loader2, Calendar, Clock, ArrowLeft, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';


export default function BookSessionPage({ params }: { params: { locale: string } }) {
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const router = useRouter();

  async function submit() {
    if (!startTime) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    // Check if selected time is in the past
    const start = new Date(startTime);
    const now = new Date();

    if (start.getTime() <= now.getTime()) {
      setError('Please select a future date and time');
      setLoading(false);
      return;
    }

    // Default duration: 1 hour
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    try {
      const res = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          // tutorId is optional, backend uses primary tutor
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Booking Error Details:', data);
        // Force details into the error message for visibility
        const errorMessage = data.details
          ? `${data.error} - Details: ${JSON.stringify(data.details)}`
          : data.error || 'Booking failed - please try another time';
        throw new Error(errorMessage);
      }

      setBookingSuccess(true);
      setMessage('Session booked successfully!');

      // Redirect after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
      setBookingSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  // Check if selected time is in the past
  const isPastTime = startTime ? new Date(startTime).getTime() <= Date.now() : false;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Dynamic Background Auras */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto py-12 px-4 space-y-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-slate-800/50 border border-slate-700 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all">
              <ArrowLeft size={14} />
            </div>
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 font-serif">
            Book a Session
          </h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Reserve your spot for a personalized 1-on-1 session with our expert tutors.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {bookingSuccess ? (
            <div className="glass-card rounded-3xl p-10 text-center border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl border border-white/5">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <motion.div
                  className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <div className="relative w-20 h-20 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3 mx-auto">
                  <Calendar size={32} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3 font-serif">Booking Confirmed!</h2>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto text-sm">
                Your session has been scheduled. Prepare to level up your English fluency.
              </p>

              <div className="max-w-xs mx-auto">
                <ConfidenceMeter label="Pre-session hype" initialLevel={0.4} />
              </div>

              <p className="text-xs text-slate-500 mt-8 animate-pulse text-sm">
                Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-3xl overflow-hidden border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
              <div className="p-8 md:p-10 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 font-serif">Select Date & Time</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700">
                      <Clock size={14} className="text-indigo-400" /> 1 Hour
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700">
                      <Zap size={14} className="text-amber-400" /> 1 Credit
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300 ml-1">
                      Start Time
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      </div>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => {
                          setError(null);
                          setStartTime(e.target.value);
                        }}
                        className="block w-full pl-12 pr-4 h-14 bg-slate-800/50 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none color-scheme-dark"
                      />
                    </div>
                    {isPastTime && (
                      <p className="text-sm text-rose-400 flex items-center gap-1.5 mt-2 ml-1">
                        <AlertCircle size={14} /> Please select a future time
                      </p>
                    )}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 text-sm text-rose-200 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3"
                    >
                      <AlertCircle size={18} className="text-rose-500 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submit}
                    disabled={loading || !startTime || isPastTime}
                    className={`w-full h-14 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${loading || !startTime || isPastTime
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 shadow-none'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-500/20'
                      }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Booking
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              <div className="px-8 py-4 bg-slate-900/50 border-t border-slate-700/50 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                  Professional Session • Expert Guidance
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}