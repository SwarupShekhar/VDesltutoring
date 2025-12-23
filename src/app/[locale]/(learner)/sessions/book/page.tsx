'use client'

import { useState } from 'react'
import { ConfidenceMeter } from '@/components/ConfidenceMeter'

export default function BookSessionPage() {
  const [startTime, setStartTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  async function submit() {
    setLoading(true)
    setMessage(null)

    // Check if selected time is in the past
    const selectedTime = new Date(startTime).getTime()
    const currentTime = new Date().getTime()
    
    if (selectedTime <= currentTime) {
      setMessage('Please select a future time')
      setLoading(false)
      return
    }

    const res = await fetch('/api/sessions/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startTime: new Date(startTime).toISOString(),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || 'Booking failed — please try another time')
      setBookingSuccess(false)
    } else {
      setMessage('Session booked successfully')
      setBookingSuccess(true)
    }

    setLoading(false)
  }

  // Check if selected time is in the past
  const isPastTime = startTime ? new Date(startTime).getTime() <= Date.now() : false

  return (
    <div style={{ padding: '16px' }}>
      <h2>Book a Session</h2>

      <p>1 credit will be used</p>

      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />

      <br /><br />

      <button 
        onClick={submit} 
        disabled={loading || !startTime || isPastTime}
      >
        {loading ? 'Booking...' : 'Book Session'}
      </button>

      {isPastTime && startTime && (
        <p style={{ color: 'red' }}>Please select a future time</p>
      )}

      {message && <p>{message}</p>}
      
      {bookingSuccess && (
        <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', backgroundColor: '#f0f9ff' }}>
          <h3 style={{ marginBottom: '12px' }}>Your confidence is growing!</h3>
          <ConfidenceMeter label="Confidence growing" initialLevel={0.55} />
        </div>
      )}
    </div>
  )
}