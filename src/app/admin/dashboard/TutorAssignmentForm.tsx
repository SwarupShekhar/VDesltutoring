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

type Tutor = {
  id: string
  name: string
  email: string
}

export function TutorAssignmentForm() {
  const [students, setStudents] = useState<Student[]>([])
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedTutorId, setSelectedTutorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null)

  // Fetch students and tutors on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch students
        const studentsRes = await fetch('/api/admin/students')
        const studentsData = await studentsRes.json()
        if (studentsRes.ok) {
          setStudents(studentsData)
        }

        // Fetch tutors
        const tutorsRes = await fetch('/api/admin/tutors')
        const tutorsData = await tutorsRes.json()
        if (tutorsRes.ok) {
          setTutors(tutorsData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    // Confirmation for tutor reassignment
    if (!confirm('Are you sure you want to assign this tutor?')) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/admin/assign-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudentId, tutorId: selectedTutorId }),
      })

      const data = await res.json()
      
      if (res.ok) {
        setResult({ success: true, message: data.message || 'Tutor assigned successfully' })
        // Reset form
        setSelectedStudentId('')
        setSelectedTutorId('')
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
  const isFormValid = selectedStudentId && selectedTutorId

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Tutor to Student</CardTitle>
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
              Tutor:
            </label>
            <select
              value={selectedTutorId}
              onChange={(e) => setSelectedTutorId(e.target.value)}
              required
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <option value="">Select a tutor</option>
              {tutors.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.name} ({tutor.email})
                </option>
              ))}
            </select>
          </div>
          
          {tutors.length === 0 && (
            <p className="text-red-500 dark:text-red-400">No tutors available</p>
          )}
          
          <Button 
            type="submit" 
            disabled={loading || !isFormValid}
          >
            {loading ? 'Assigning...' : 'Assign Tutor'}
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