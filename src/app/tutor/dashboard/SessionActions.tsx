'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function SessionActions({
  sessionId,
  status,
  startTime,
}: {
  sessionId: string
  status: string
  startTime: string
}) {
  const [loading, setLoading] = useState(false)
  const now = Date.now()
  const start = new Date(startTime).getTime()
  const diffMinutes = Math.round((start - now) / 60000)

  const canMark =
    status === 'LIVE' ||
    (status === 'SCHEDULED' && diffMinutes <= 0)

  if (!canMark) return null

  async function mark(statusValue: 'COMPLETED' | 'NO_SHOW') {
    setLoading(true)
    await fetch('/api/sessions/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, status: statusValue }),
    })

    location.reload()
  }

  return (
    <div className="flex gap-2 mt-2">
      <Button 
        onClick={() => mark('COMPLETED')} 
        disabled={loading}
        size="sm"
        variant="outline"
      >
        Mark Completed
      </Button>
      <Button 
        onClick={() => mark('NO_SHOW')} 
        disabled={loading}
        size="sm"
        variant="outline"
      >
        Mark No-Show
      </Button>
    </div>
  )
}