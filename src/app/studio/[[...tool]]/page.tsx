'use client'

import { useState, useEffect } from 'react'
import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export const dynamic = 'force-dynamic'

export default function StudioPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div data-nxt-studio-container>
      <NextStudio config={config} />
    </div>
  )
}
