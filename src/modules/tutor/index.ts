/**
 * Tutor Module
 * 
 * Handles tutor dashboard and session management.
 */

// Types
export interface TutorDashboardData {
    upcomingSessions: TutorSession[]
    completedSessions: TutorSession[]
    totalEarnings: number
    totalHours: number
}

export interface TutorSession {
    id: string
    studentName: string
    scheduledAt: Date
    status: string
    duration?: number
}

export interface TutorProfile {
    id: string
    name: string
    bio?: string
    languages: string[]
    hourlyRate: number
    rating: number
    totalSessions: number
}
