/**
 * Admin Module
 * 
 * Handles admin dashboard and management functions.
 */

export * from './types'
export * from './logic'

// UI Components
export { AdminControls } from './ui/AdminControls'

// Types (Legacy/Previous)
export interface AdminDashboardData {
    totalStudents: number
    totalTutors: number
    totalSessions: number
    pendingSessions: number
    completedSessions: number
    recentActivity: AdminActivity[]
}

export interface AdminActivity {
    id: string
    type: 'session_booked' | 'session_completed' | 'user_registered' | 'credit_adjusted'
    description: string
    timestamp: Date
}

export interface CreditAdjustment {
    userId: string
    amount: number
    reason: string
    adjustedBy: string
}

export interface TutorAssignment {
    tutorId: string
    sessionId: string
    assignedBy: string
}
