import { cookies } from 'next/headers'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfidenceMeter } from '@/components/ConfidenceMeter'

async function getMe() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/me`, {
    cache: 'no-store',
    headers: {
      cookie: cookies().toString(),
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch user')
  }

  return res.json()
}

async function getSessions() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/sessions?role=learner`,
    {
      cache: 'no-store',
      headers: {
        cookie: cookies().toString(),
      },
    }
  )

  if (!res.ok) {
    throw new Error('Failed to fetch sessions')
  }

  const data = await res.json()
  return data.sessions
}

export default async function LearnerDashboard() {
  const me = await getMe()
  const sessions = await getSessions()

  const upcomingSession = sessions.find(
    (s: any) => s.status === 'SCHEDULED'
  )

  // Filter sessions for history (excluding upcoming)
  const sessionHistory = sessions.filter(
    (s: any) => s.status !== 'SCHEDULED'
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learner Dashboard</h1>
        <Button>
          <a href="/sessions/book" className="text-white no-underline">
            Book a new session
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Credits Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{me.credits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Session</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSession ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {new Date(upcomingSession.start_time).toLocaleString()}
                  </span>
                  <Badge>{upcomingSession.status}</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tutor: {upcomingSession.tutor?.name || 'Not assigned'}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No upcoming sessions</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confidence Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConfidenceMeter label="Speaking confidence" initialLevel={0.35} />
            <ConfidenceMeter label="Listening confidence" initialLevel={0.45} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionHistory.length > 0 ? (
            <div className="space-y-4">
              {sessionHistory.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="font-medium">
                      {new Date(s.start_time).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Tutor: {s.tutor?.name || 'Not assigned'}
                    </div>
                  </div>
                  <Badge variant={s.status === 'COMPLETED' ? 'default' : 'destructive'}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">You don't have any session history yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}