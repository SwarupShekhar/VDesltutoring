'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

type Student = {
  id: string
  name: string
  email: string
  credits: number
}

export function CreditAdjustmentForm() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null)

  // Fetch students on component mount
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch('/api/admin/students')
        const data = await res.json()
        if (res.ok) {
          setStudents(data)
        }
      } catch (error) {
        console.error('Failed to fetch students:', error)
      }
    }

    fetchStudents()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    // Confirmation for credit deductions
    if (parseInt(amount) < 0) {
      if (!confirm('Are you sure you want to deduct credits?')) {
        setLoading(false)
        return
      }
    }

    try {
      const res = await fetch('/api/admin/adjust-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: selectedStudentId, 
          amount: parseInt(amount), 
          reason 
        }),
      })

      const data = await res.json()
      
      if (res.ok) {
        setResult({ success: true, message: data.message || 'Credits adjusted successfully' })
        // Reset form
        setSelectedStudentId('')
        setAmount('')
        setReason('')
      } else {
        setResult({ success: false, message: data.error || 'Action could not be completed' })
      }
    } catch (error) {
      setResult({ success: false, message: 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  // Check if form is valid for submission
  const isFormValid = selectedStudentId && amount && parseInt(amount) !== 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjust Student Credits</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Student:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email}) - {student.credits} credits
                </option>
              ))}
            </select>
          </div>
          
          {students.length === 0 && (
            <p className="text-red-500 dark:text-red-400">No students found</p>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount (positive or negative):
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Reason:
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading || !isFormValid}
          >
            {loading ? 'Adjusting...' : 'Adjust Credits'}
          </Button>
        </form>
        
        {result && (
          <div className={`mt-4 p-3 rounded-md ${result.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
            {result.message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}