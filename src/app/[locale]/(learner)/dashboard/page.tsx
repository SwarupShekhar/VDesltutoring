import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getDictionary, type Locale } from '@/i18n/getDictionary'
import { DashboardError } from '@/components/DashboardError'
import { getDashboardData } from '@/lib/data/dashboard';
import { DailyInsightCard } from '@/components/DailyInsightCard';
import { CEFRDashboard } from '@/components/dashboard/CEFRDashboard';
import { TrainingHub } from '@/components/dashboard/TrainingHub';
import { CEFRPathCard } from '@/components/dashboard/CEFRPathCard';

// Disable caching to ensure fluency profile updates are immediately visible
export const revalidate = 0;

export default async function LearnerDashboard({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const t = dict.dashboard || {}

  let me = { credits: 0 };
  let sessions = [];
  let cefrProfile = null;
  let trialCooldown = false;
  let timeUntilNextTrial = 0;
  let error = null;

  try {
    const data = await getDashboardData('LEARNER');
    me.credits = data.credits || 0;
    sessions = data.sessions;
    cefrProfile = data.cefrProfile;
    // @ts-ignore
    trialCooldown = data.trialCooldown || false;
    // @ts-ignore
    timeUntilNextTrial = data.timeUntilNextTrial || 0;
  } catch (err) {
    console.error("Dashboard data fetch error:", err);
    error = err instanceof Error ? err.message : "Unknown error occurred";
  }

  const upcomingSession = sessions.find(
    (s: any) => s.status === 'SCHEDULED'
  )

  // Filter sessions for history
  const sessionHistory = sessions.filter(
    (s: any) => s.status !== 'SCHEDULED'
  )

  if (error) {
    return <DashboardError message={error} retryLabel={t.retry || "Retry"} />
  }

  const now = new Date()
  const isExpired = upcomingSession && (new Date(upcomingSession.start_time).getTime() + 60 * 60 * 1000) < now.getTime()

  // Fallback profile if user is new
  // In a real app, this should probably be an "Empty State" component
  const safeProfile = cefrProfile || {
    fluency: { score: 0, cefr: 'A1', label: 'Beginner' },
    pronunciation: { score: 0, cefr: 'A1', label: 'Beginner' },
    grammar: { score: 0, cefr: 'A1', label: 'Beginner' },
    vocabulary: { score: 0, cefr: 'A1', label: 'Beginner' },
    overall: { score: 0, cefr: 'A1', label: 'Beginner' },
    weakest: 'fluency',
    strongest: 'fluency',
    speakingTime: 0
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-1">{t.learnerTitle || 'Learner Dashboard'}</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, {me.credits > 0 ? 'Professional' : 'Guest'}.</p>
        </div>
        <div className="flex gap-4 items-center">
          <Button variant="outline" className="hidden sm:flex rounded-full px-6">
            <a href={`/${locale}/sessions/book`} className="no-underline">
              {t.bookSession || 'Book a Tutor'}
            </a>
          </Button>
          <Button variant="outline" className="rounded-full px-6">
            <Link href={`/${locale}/history`} className="no-underline">
              View History
            </Link>
          </Button>
          <Button className="rounded-full px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform">
            <Link href="/ai-tutor" className="no-underline">
              {t.startAiSession || 'Start AI Audit'}
            </Link>
          </Button>
        </div>
      </div>

      {/* DAILY INSIGHT - KEEPING THIS AS IT'S NICE */}
      <DailyInsightCard />

      {/* TRAINING HUB - NEW COMMAND CENTER */}
      <TrainingHub />

      {/* CEFR PATH CARD - PROGRESSION OVERVIEW */}
      <CEFRPathCard />

      {/* MAIN CEFR DASHBOARD - REPLACES NARRATIVE CARDS */}
      {cefrProfile ? (
        <CEFRDashboard
          profile={cefrProfile}
          trialCooldown={trialCooldown}
          timeUntilNextTrial={timeUntilNextTrial}
          dict={t}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-6">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
            <span className="text-3xl">❓</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.gamification?.levelUnassessed || "Level: Unassessed"}</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              {t.gamification?.unknownLevelDesc || "We don't know your English level yet. Take a short 2-minute diagnostic conversation to find your baseline."}
            </p>
          </div>

          <Button size="lg" className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20" asChild>
            <Link href="/ai-tutor">{t.gamification?.startBaseline || "Start Baseline Assessment"}</Link>
          </Button>
        </div>
      )}

      {/* OPERATIONAL ROW: CREDITS & UPCOMING */}
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