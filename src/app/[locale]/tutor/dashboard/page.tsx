import { cookies } from 'next/headers'
import { SessionActions } from './SessionActions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

async function getSessions() {
  const cookieStore = await cookies()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/sessions?role=tutor`,
    {
      cache: 'no-store',
      headers: {
        cookie: cookieStore.toString(),
      },
    }
  )

  if (!res.ok) {
    throw new Error('Failed to fetch tutor sessions')
  }

  const data = await res.json()
  return data.sessions
}

export default async function TutorDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const sessions = await getSessions()
  const now = Date.now()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tutor Dashboard</h1>

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