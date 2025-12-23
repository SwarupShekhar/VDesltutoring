import { cookies } from 'next/headers'
import { SessionActions } from './SessionActions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

import { getDashboardData } from '@/lib/data/dashboard';

import { DashboardError } from '@/components/DashboardError'

export default async function TutorDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  let sessions = [];
  let notifications = [];
  let error = null;

  try {
    const data = await getDashboardData('TUTOR');
    sessions = data.sessions;
    notifications = (data as any).notifications || [];
  } catch (err) {
    console.error("Tutor Dashboard fetch error:", err);
    error = err instanceof Error ? err.message : "Unknown error occurred";
  }

  if (error) {
    return <DashboardError message={error} />
  }

  const now = Date.now()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tutor Dashboard</h1>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              🔔 New Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {notifications.map((n: any) => (
                <li key={n.id} className="text-sm p-3 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-blue-900 shadow-sm">
                  <p className="font-semibold text-blue-700 dark:text-blue-300">{n.title}</p>
                  <p className="text-gray-600 dark:text-gray-300">{n.message}</p>
                  <span className="text-xs text-gray-400 mt-1 block">{new Date(n.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Today & Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((s: any) => {
                const start = new Date(s.start_time).getTime()
                const diffMinutes = Math.round((start - now) / 60000)

                // Hide actions for completed/no-show sessions
                const showActions = !['COMPLETED', 'NO_SHOW'].includes(s.status)

                return (
                  <div key={s.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {new Date(s.start_time).toLocaleString(locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Student: {s.student?.name || 'Not assigned'}
                        </div>
                      </div>
                      <Badge>{s.status}</Badge>
                    </div>

                    <div className="mt-3">
                      {!showActions && (
                        <div className="text-sm text-green-600 dark:text-green-400">Session completed</div>
                      )}

                      {showActions && diffMinutes > 0 && (
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">Awaiting session time</div>
                      )}

                      {showActions && diffMinutes <= 0 && diffMinutes > -60 && (
                        <div className="text-sm text-blue-600 dark:text-blue-400">Session in progress</div>
                      )}

                      {showActions && (
                        <div className="mt-2">
                          <SessionActions
                            sessionId={s.id}
                            status={s.status}
                            startTime={s.start_time}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No upcoming sessions</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}