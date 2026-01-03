import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfidenceMeter } from '@/components/ConfidenceMeter'
import { getDictionary, type Locale } from '@/i18n/getDictionary'
import { DashboardError } from '@/components/DashboardError'



import { getDashboardData } from '@/lib/data/dashboard';
import { DailyInsightCard } from '@/components/DailyInsightCard';

export default async function LearnerDashboard({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const t = dict.dashboard || {}

  let me = { credits: 0 };
  let sessions = [];
  let aiSessions: any[] = [];
  let progress: { speaking: number; listening: number } | undefined;
  let error = null;

  try {
    const data = await getDashboardData('LEARNER');
    me.credits = data.credits || 0;
    sessions = data.sessions;
    aiSessions = data.aiSessions || [];
    progress = data.progress;
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

  // Extract Identity from the most recent AI session that has one
  const latestIdentity = aiSessions.find(s => s.report?.identity)?.report?.identity || null;

  // Build Timeline Data (Mock + Real)
  // Logic: Combine AI sessions into a weekly view. For now, strict list.
  const timeline = aiSessions.map((s, i) => ({
    id: s.id,
    date: new Date(s.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
    status: i === 0 ? 'Current' : 'Past',
    label: s.report ? (s.report.patterns?.[0] || 'Practice Session') : 'Practice Session'
  })).reverse();


  if (error) {
    return <DashboardError message={error} retryLabel={t.retry || "Retry"} />
  }

  const now = new Date()
  const isExpired = upcomingSession && (new Date(upcomingSession.start_time).getTime() + 60 * 60 * 1000) < now.getTime()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
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
          <Button className="rounded-full px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform">
            <Link href="/ai-tutor" className="no-underline">
              {t.startAiSession || 'Start AI Audit'}
            </Link>
          </Button>
        </div>
      </div>

      {/* DAILY INSIGHT */}
      <DailyInsightCard />

      {/* IDENTITY & TIMELINE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 1. IDENTITY CARD */}
        <div className="lg:col-span-1">
          <Card className="h-full border-blue-100 dark:border-blue-900 bg-gradient-to-b from-white to-blue-50/20 dark:from-slate-900 dark:to-blue-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm uppercase tracking-widest">
                Speaking Identity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestIdentity ? (
                <div className="mt-2">
                  <div className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-3">
                    {latestIdentity.archetype}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {latestIdentity.description}
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                  <p className="italic">No identity established yet.</p>
                  <Button variant="ghost" asChild className="mt-2 text-blue-500">
                    <Link href="/ai-tutor">Start a session to discover yours</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 2. FLUENCY JOURNEY (Timeline) */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-6">

            {/* Invisible Progress Stats (New) */}
            {aiSessions.length > 1 && (() => {
              const current = aiSessions[0].report?.metrics || { wordCount: 0, fillerPercentage: 0 };
              const previous = aiSessions[1].report?.metrics || { wordCount: 0, fillerPercentage: 0 };

              const spokeMore = previous.wordCount > 0 ? Math.round(((current.wordCount - previous.wordCount) / previous.wordCount) * 100) : 0;
              const fillerImprovement = previous.fillerPercentage - current.fillerPercentage;

              return (
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Volume</p>
                        <p className="text-slate-900 dark:text-white font-serif font-bold text-lg">
                          {spokeMore > 0 ? `+${spokeMore}% more words` : `${Math.abs(spokeMore)}% less words`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Clarity</p>
                        <p className="text-slate-900 dark:text-white font-serif font-bold text-lg">
                          {fillerImprovement > 0 ? `${fillerImprovement}% less fillers` : 'Stable flow'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })()}

            <Card className="h-full">
              <CardHeader>
                <CardTitle>Fluency Journey</CardTitle>
              </CardHeader>
              <CardContent>
                {timeline.length > 0 ? (
                  <div className="relative pl-4 pt-2">
                    {/* Vertical Line */}
                    <div className="absolute left-[21px] top-4 bottom-4 w-[2px] bg-slate-100 dark:bg-slate-800" />

                    <div className="space-y-8">
                      {timeline.map((item, idx) => (
                        <div key={item.id} className="relative flex items-start gap-6 group">
                          {/* Dot */}
                          <div className={`z-10 w-3 h-3 mt-1.5 rounded-full border-2 ${idx === timeline.length - 1 ? 'bg-green-500 border-green-500 ring-4 ring-green-100 dark:ring-green-900/30' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'}`} />

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className={`font-medium ${idx === timeline.length - 1 ? 'text-slate-900 dark:text-white text-lg' : 'text-slate-500 dark:text-slate-400'}`}>
                                {idx === timeline.length - 1 ? 'Current Stage' : item.date}
                              </h4>
                              {idx === timeline.length - 1 && <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Latest</Badge>}
                            </div>
                            <p className={`mt-1 ${idx === timeline.length - 1 ? 'text-slate-700 dark:text-gray-300' : 'text-slate-400 dark:text-gray-500 line-through decoration-slate-300'}`}>
                              {item.label}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Your journey begins with your first conversation.</p>
                    <Link href="/ai-tutor">
                      <Button variant="outline">Start Session</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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
            <ConfidenceMeter label={t.confidenceSpeaking || "Speaking confidence"} initialLevel={progress?.speaking || 0.35} />
            <ConfidenceMeter label={t.confidenceListening || "Listening confidence"} initialLevel={progress?.listening || 0.45} />
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