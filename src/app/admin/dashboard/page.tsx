import { cookies } from 'next/headers'
import { EvidenceViewer } from './EvidenceViewer'
import { CreditAdjustmentForm } from './CreditAdjustmentForm'
import { TutorAssignmentForm } from './TutorAssignmentForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

async function getSessions() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/sessions?role=admin`,
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

export default async function AdminDashboard() {
  const sessions = await getSessions()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((s: any) => (
                <div key={s.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {new Date(s.start_time).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Student: {s.student?.name || 'Not assigned'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Tutor: {s.tutor?.name || 'Not assigned'}
                      </div>
                    </div>
                    <Badge>{s.status}</Badge>
                  </div>
                  <div className="mt-3">
                    <EvidenceViewer sessionId={s.id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No sessions found</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CreditAdjustmentForm />
        <TutorAssignmentForm />
      </div>
    </div>
  )
}