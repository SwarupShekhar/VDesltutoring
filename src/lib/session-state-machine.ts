import { Prisma, session_status } from '@prisma/client'
import { ApiErrors } from './api-response'

/**
 * Session State Machine
 * 
 * Defines valid state transitions and business rules for session lifecycle
 * 
 * States:
 * - SCHEDULED: Initial state when session is booked
 * - LIVE: Session is currently happening
 * - COMPLETED: Session finished successfully
 * - CANCELLED: Session was cancelled before start
 * - NO_SHOW: Session started but participant didn't attend
 */

// Define valid transitions
const VALID_TRANSITIONS: Record<session_status, session_status[]> = {
  SCHEDULED: ['LIVE', 'CANCELLED', 'COMPLETED'], // Scheduled sessions can become live, cancelled, or directly completed
  LIVE: ['COMPLETED', 'NO_SHOW'],                // Live sessions can only be completed or marked as no-show
  COMPLETED: [],                                 // Completed sessions cannot transition to any other state
  CANCELLED: [],                                 // Cancelled sessions cannot transition to any other state
  NO_SHOW: [],                                   // No-show sessions cannot transition to any other state
}

// Define business rules for each transition
interface TransitionRule {
  canTransition: (context: TransitionContext) => boolean | Promise<boolean>
  errorMessage: string
  errorCode: string
}

interface TransitionContext {
  sessionId: string
  fromStatus: session_status
  toStatus: session_status
  userId: string
  userRole: string | null
  sessionData?: any // Additional session data for validation (optional)
}

// Business rules for specific transitions
const TRANSITION_RULES: Record<string, TransitionRule[]> = {
  'SCHEDULED->LIVE': [
    {
      canTransition: ({ sessionData }) => {
        const now = new Date()
        // Session can go live if it's within 15 minutes of start time
        const fifteenMinutesBefore = new Date(sessionData.start_time.getTime() - 15 * 60 * 1000)
        const fifteenMinutesAfter = new Date(sessionData.end_time.getTime() + 15 * 60 * 1000)
        return now >= fifteenMinutesBefore && now <= fifteenMinutesAfter
      },
      errorMessage: 'Session can only go live within 15 minutes of scheduled start time',
      errorCode: 'SESSION_INVALID_LIVE_TIME'
    }
  ],
  'SCHEDULED->CANCELLED': [
    {
      canTransition: ({ sessionData, userRole }) => {
        const now = new Date()
        // Admins can cancel anytime, others need 2 hours notice
        if (userRole === 'ADMIN') return true
        
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)
        return sessionData.start_time >= twoHoursFromNow
      },
      errorMessage: 'Cannot cancel sessions less than 2 hours before start time (unless admin)',
      errorCode: 'SESSION_CANCEL_TOO_LATE'
    }
  ],
  'SCHEDULED->COMPLETED': [
    {
      canTransition: ({ userRole }) => userRole === 'ADMIN', // Only admins can directly complete scheduled sessions
      errorMessage: 'Only admins can directly complete scheduled sessions',
      errorCode: 'SESSION_INVALID_COMPLETION'
    }
  ],
  'LIVE->COMPLETED': [
    {
      canTransition: () => true, // Live sessions can always be completed
      errorMessage: '',
      errorCode: ''
    }
  ],
  'LIVE->NO_SHOW': [
    {
      canTransition: () => true, // Live sessions can always be marked as no-show
      errorMessage: '',
      errorCode: ''
    }
  ]
}

/**
 * Validates if a session status transition is allowed
 * @param fromStatus Current session status
 * @param toStatus Target session status
 * @param context Additional context for validation
 * @returns True if transition is valid, throws error if not
 */
export async function validateSessionTransition(
  fromStatus: session_status,
  toStatus: session_status,
  context: TransitionContext
): Promise<boolean> {
  // Check if transition is valid according to state machine
  const validTransitions = VALID_TRANSITIONS[fromStatus] || []
  if (!validTransitions.includes(toStatus)) {
    throw ApiErrors.forbidden(
      `Cannot transition session from ${fromStatus} to ${toStatus}`
    )
  }

  // Check business rules for this specific transition
  const transitionKey = `${fromStatus}->${toStatus}`
  const rules = TRANSITION_RULES[transitionKey] || []
  
  for (const rule of rules) {
    const isValid = await rule.canTransition(context)
    if (!isValid) {
      throw ApiErrors.forbidden(rule.errorMessage)
    }
  }

  return true
}

/**
 * Gets all valid next states for a given session status
 * @param currentStatus Current session status
 * @returns Array of valid next statuses
 */
export function getValidNextStates(currentStatus: session_status): session_status[] {
  return VALID_TRANSITIONS[currentStatus] || []
}

/**
 * Creates a session with initial state validation
 * @param sessionData Session creation data
 * @returns Validated session data with initial status
 */
export function createSessionWithValidation(sessionData: any) {
  // Sessions are always created as SCHEDULED
  return {
    ...sessionData,
    status: 'SCHEDULED' as session_status
  }
}

/**
 * Updates session status with validation
 * @param prisma Prisma transaction client
 * @param sessionId Session ID to update
 * @param newStatus New status to set
 * @param context Additional context for validation
 * @returns Updated session
 */
export async function updateSessionStatus(
  prisma: any, // Prisma transaction client
  sessionId: string,
  newStatus: session_status,
  context: Omit<TransitionContext, 'fromStatus' | 'toStatus'>
) {
  // First, get current session status
  const session = await prisma.sessions.findUnique({
    where: { id: sessionId },
    select: { 
      status: true,
      start_time: true,
      end_time: true,
      student_id: true,
      tutor_id: true
    }
  })

  if (!session) {
    throw ApiErrors.sessionNotFound()
  }

  // Validate the transition
  const transitionContext: TransitionContext = {
    ...context,
    fromStatus: session.status!,
    toStatus: newStatus,
    sessionData: session
  }

  await validateSessionTransition(session.status!, newStatus, transitionContext)

  // Perform the update
  return await prisma.sessions.update({
    where: { id: sessionId },
    data: { status: newStatus },
    select: {
      id: true,
      status: true,
      start_time: true,
      end_time: true
    }
  })
}

/**
 * Atomic session status update with race condition protection
 * Uses database-level constraints to ensure consistency
 * @param prisma Prisma transaction client
 * @param sessionId Session ID to update
 * @param newStatus New status to set
 * @param expectedCurrentStatus Current status that must match (prevents race conditions)
 * @param context Additional context for validation
 * @returns Updated session or throws error
 */
export async function atomicUpdateSessionStatus(
  prisma: any, // Prisma transaction client
  sessionId: string,
  newStatus: session_status,
  expectedCurrentStatus: session_status,
  context: Omit<TransitionContext, 'fromStatus' | 'toStatus' | 'sessionData'>
) {
  // First validate the transition logic
  const transitionContext: TransitionContext = {
    ...context,
    fromStatus: expectedCurrentStatus,
    toStatus: newStatus,
    sessionData: {} // Will be populated in update
  }

  await validateSessionTransition(expectedCurrentStatus, newStatus, transitionContext)

  try {
    // Attempt atomic update with status constraint
    const updatedSession = await prisma.sessions.update({
      where: { 
        id: sessionId,
        status: expectedCurrentStatus // This ensures no race condition
      },
      data: { status: newStatus },
      select: {
        id: true,
        status: true,
        start_time: true,
        end_time: true
      }
    })

    return updatedSession
  } catch (error) {
    // Check if it's a Prisma record not found error (race condition)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Re-fetch to see actual status
      const currentSession = await prisma.sessions.findUnique({
        where: { id: sessionId },
        select: { status: true }
      })

      if (currentSession?.status !== expectedCurrentStatus) {
        throw ApiErrors.forbidden(
          `Session status changed unexpectedly. Current status: ${currentSession?.status || 'unknown'}`
        )
      }
      
      // Some other error occurred
      throw error
    }
    
    throw error
  }
}

// Export types for convenience
export type SessionStatus = session_status
export { session_status }