import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfidenceMeter } from '@/components/ConfidenceMeter'
import { getDictionary, type Locale } from '@/i18n/getDictionary'
import { DashboardError } from '@/components/DashboardError'



import { getDashboardData } from '@/lib/data/dashboard';

export default async function LearnerDashboard({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const t = dict.dashboard || {}

  let me = { credits: 0 };
  let sessions = [];
  let error = null;

  try {
    const data = await getDashboardData('LEARNER');
    me.credits = data.credits || 0;
    sessions = data.sessions;
  } catch (err) {
    console.error("Dashboard data fetch error:", err);
    error = err instanceof Error ? err.message : "Unknown error occurred";
  }

  const upcomingSession = sessions.find(
    (s: any) => s.status === 'SCHEDULED'
  )

  // Filter sessions for history (excluding upcoming)
  const sessionHistory = sessions.filter(
    (s: any) => s.status !== 'SCHEDULED'
  )

  // ...

  if (error) {
    return <DashboardError message={error} retryLabel={t.retry || "Retry"} />
  }

  const now = new Date()
  const isExpired = upcomingSession && (new Date(upcomingSession.start_time).getTime() + 60 * 60 * 1000) < now.getTime()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.learnerTitle || 'Learner Dashboard'}</h1>
        <Button>
          <a href={`/${locale}/sessions/book`} className="text-white no-underline">
            {t.bookSession || 'Book a new session'}
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.creditsRemaining || 'Credits Remaining'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{me.credits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.nextSession || 'Next Session'}</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSession ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {new Date(upcomingSession.start_time).toLocaleString(locale)}
                    </span>
                    {isExpired ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge>{upcomingSession.status}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.tutor || 'Tutor'}: {upcomingSession.tutor?.name || (t.notAssigned || 'Not assigned')}
                  </p>
                </div>

                {/* Join Button */}
                <div className="flex gap-2">
                  <Link href={isExpired ? '#' : `/sessions/${upcomingSession.id}`} prefetch={false} className={isExpired ? 'pointer-events-none' : ''}>
                    <Button disabled={isExpired} className="w-full flex items-center gap-2 text-white">
                      Join Session
                    </Button>
                  </Link>
                  {upcomingSession.meeting_link && !isExpired && (
                    <Button variant="outline" asChild>
                      <a href={upcomingSession.meeting_link} target="_blank" rel="noopener noreferrer">
                        External Link
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">{t.noUpcoming || 'No upcoming sessions'}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confidence Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.yourProgress || 'Your Progress'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConfidenceMeter label={t.confidenceSpeaking || "Speaking confidence"} initialLevel={0.35} />
            <ConfidenceMeter label={t.confidenceListening || "Listening confidence"} initialLevel={0.45} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.history || 'Session History'}</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionHistory.length > 0 ? (
            <div className="space-y-4">
              {sessionHistory.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="font-medium">
                      {new Date(s.start_time).toLocaleString(locale)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t.tutor || 'Tutor'}: {s.tutor?.name || (t.notAssigned || 'Not assigned')}
                    </div>
                  </div>
                  <Badge variant={s.status === 'COMPLETED' ? 'default' : 'destructive'}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">{t.noHistory || "You don't have any session history yet"}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}