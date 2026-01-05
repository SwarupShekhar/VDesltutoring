/**
 * Sessions Module
 * 
 * Handles LiveKit tutoring sessions.
 */

// Re-export session state machine functions
export {
    validateSessionTransition,
    getValidNextStates,
    createSessionWithValidation,
    updateSessionStatus,
    atomicUpdateSessionStatus,
    session_status as SessionStatus
} from '@/lib/session-state-machine'

// Types
export interface Session {
    id: string
    tutorId: string
    studentId: string
    status: string
    scheduledAt: Date
    startedAt?: Date
    endedAt?: Date
}

export interface SessionBooking {
    tutorId: string
    studentId: string
    scheduledAt: Date
    packageId?: string
}
