'use client'

import { Button } from '@/components/ui/Button'

export function EvidenceViewer({ sessionId }: { sessionId: string }) {
  async function viewEvidence() {
    const res = await fetch(`/api/admin/sessions/${sessionId}/evidence`)
    const data = await res.json()
    alert(JSON.stringify(data, null, 2))
  }

  return (
    <Button onClick={viewEvidence} size="sm" variant="outline">
      View Evidence
    </Button>
  )
}