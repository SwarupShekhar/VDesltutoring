'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { Loader2, Calendar, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-6">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Book a Session</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Choose a time for your next lesson</p>
        </div>

        {bookingSuccess ? (
          <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-900/10">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} />
              </div>
              <h2 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-6">Redirecting you to the dashboard...</p>
              <ConfidenceMeter label="Confidence boosted" initialLevel={0.4} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
              <CardDescription>
                Session Duration: 1 Hour • Cost: 1 Credit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => {
                    setError(null);
                    setStartTime(e.target.value);
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {isPastTime && (
                  <p className="text-sm text-destructive">Please select a future time</p>
                )}
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              <Button
                onClick={submit}
                className="w-full"
                disabled={loading || !startTime || isPastTime}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}