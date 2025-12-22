import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
// import { validateWebhookSignature } from '@/lib/auth-utils'
// NOTE: Will implement webhook signature validation when LiveKit signing key is configured
import { atomicUpdateSessionStatus } from '@/lib/session-state-machine'
import { AuditLogger } from '@/lib/audit-logger'

/**
 * LiveKit Webhook Handler
 * 
 * Receives real-time events from LiveKit and updates session states accordingly
 * 
 * Event Types Handled:
 * - room_started: Session becomes LIVE when room is created
 * - participant_joined: Track who joined and when
 * - participant_left: Track who left and when
 * - room_finished: Session can be marked COMPLETED or NO_SHOW
 */

// Webhook event types we care about
type LiveKitEventType = 
  | 'room_started'
  | 'room_finished'
  | 'participant_joined'
  | 'participant_left'
  | 'track_published'
  | 'track_unpublished'

interface LiveKitWebhookEvent {
  event: LiveKitEventType
  room: {
    name: string // This will be our session ID
    sid: string
    emptyAt?: number
    createdAt: number
    endedAt?: number
  }
  participant?: {
    identity: string
    name: string
    kind: 'standard' | 'sip' | 'agent'
    joinedAt: number
    leftAt?: number
    metadata?: string
  }
  track?: {
    sid: string
    type: 'audio' | 'video' | 'data'
    source: string
    publisher: string
  }
  createdAt: number
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validate webhook signature (if configured)
    // Note: LiveKit webhook validation requires setting up a signing key in LiveKit dashboard
    // For now, we'll process events without strict validation but log for security review
    
    // 2. Parse webhook payload
    const payload: LiveKitWebhookEvent = await req.json()
    
    console.log('[LiveKit Webhook] Received event:', payload.event, 'for room:', payload.room?.name)
    
    // 3. Extract session ID from room name
    const sessionId = payload.room?.name
    if (!sessionId) {
      console.warn('[LiveKit Webhook] Missing session ID in room name')
      return new Response(null, { status: 200 }) // Acknowledge but don't process
    }
    
    // 4. Get session from database
    const session = await prisma.sessions.findUnique({
      where: { id: sessionId },
      include: {
        student_profiles: true,
        tutor_profiles: true,
      },
    })
    
    if (!session) {
      console.warn('[LiveKit Webhook] Session not found:', sessionId)
      return new Response(null, { status: 200 }) // Acknowledge but don't process
    }
    
    // 5. Handle different event types
    switch (payload.event) {
      case 'room_started':
        await handleRoomStarted(session)
        break
        
      case 'participant_joined':
        await handleParticipantJoined(session, payload.participant)
        break
        
      case 'participant_left':
        await handleParticipantLeft(session, payload.participant)
        break
        
      case 'room_finished':
        await handleRoomFinished(session)
        break
        
      default:
        // Ignore other events
        console.log('[LiveKit Webhook] Ignoring event type:', payload.event)
    }
    
    // 6. Acknowledge receipt
    return new Response(null, { status: 200 })
    
  } catch (error) {
    console.error('[LiveKit Webhook] Error processing webhook:', error)
    // Still acknowledge to prevent webhook retries
    return new Response(null, { status: 200 })
  }
}

/**
 * Handle room started event - session becomes LIVE
 */
async function handleRoomStarted(session: any) {
  // Only transition to LIVE if currently SCHEDULED
  if (session.status === 'SCHEDULED') {
    try {
      await atomicUpdateSessionStatus(
        prisma,
        session.id,
        'LIVE',
        'SCHEDULED',
        {
          sessionId: session.id,
          userId: 'system',
          userRole: 'SYSTEM',
        }
      )
      
      console.log('[LiveKit Webhook] Session marked as LIVE:', session.id)
      
      // Log audit event
      await AuditLogger.logSessionLifecycle(prisma, {
        sessionId: session.id,
        studentId: session.student_id,
        tutorId: session.tutor_id,
        oldStatus: 'SCHEDULED',
        newStatus: 'LIVE',
        triggeredBy: 'SYSTEM',
        reason: 'Room started in LiveKit',
      })
    } catch (error) {
      console.error('[LiveKit Webhook] Failed to transition session to LIVE:', error)
    }
  }
}

/**
 * Handle participant joined event - track join times
 */
async function handleParticipantJoined(session: any, participant: any) {
  if (!participant) return
  
  try {
    // Parse participant metadata to determine role
    let participantRole = 'unknown'
    let userId = participant.identity
    
    try {
      if (participant.metadata) {
        const metadata = JSON.parse(participant.metadata)
        participantRole = metadata.role || 'unknown'
        userId = metadata.userId || participant.identity
      }
    } catch (parseError) {
      console.warn('[LiveKit Webhook] Failed to parse participant metadata')
    }
    
    // Log join event
    await AuditLogger.logUserAction(prisma, {
      userId: userId,
      userType: participantRole.toUpperCase() as any,
      action: 'Joined session room',
      resourceId: session.id,
      resourceType: 'session',
      details: {
        role: participantRole,
        joinTime: new Date(participant.joinedAt * 1000).toISOString(),
        participantIdentity: participant.identity,
      },
    })
    
    console.log('[LiveKit Webhook] Participant joined:', {
      sessionId: session.id,
      participant: participant.identity,
      role: participantRole,
    })
  } catch (error) {
    console.error('[LiveKit Webhook] Failed to log participant join:', error)
  }
}

/**
 * Handle participant left event - track leave times
 */
async function handleParticipantLeft(session: any, participant: any) {
  if (!participant) return
  
  try {
    // Parse participant metadata to determine role
    let participantRole = 'unknown'
    let userId = participant.identity
    
    try {
      if (participant.metadata) {
        const metadata = JSON.parse(participant.metadata)
        participantRole = metadata.role || 'unknown'
        userId = metadata.userId || participant.identity
      }
    } catch (parseError) {
      console.warn('[LiveKit Webhook] Failed to parse participant metadata')
    }
    
    // Log leave event
    await AuditLogger.logUserAction(prisma, {
      userId: userId,
      userType: participantRole.toUpperCase() as any,
      action: 'Left session room',
      resourceId: session.id,
      resourceType: 'session',
      details: {
        role: participantRole,
        leaveTime: new Date(participant.leftAt! * 1000).toISOString(),
        participantIdentity: participant.identity,
      },
    })
    
    console.log('[LiveKit Webhook] Participant left:', {
      sessionId: session.id,
      participant: participant.identity,
      role: participantRole,
    })
  } catch (error) {
    console.error('[LiveKit Webhook] Failed to log participant leave:', error)
  }
}

/**
 * Handle room finished event - determine final session status
 */
async function handleRoomFinished(session: any) {
  try {
    // Check if session needs to be finalized
    const currentTime = new Date()
    
    // If session is already in a final state, don't change it
    if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(session.status)) {
      return
    }
    
    // Determine appropriate final state based on current state and timing
    let finalStatus: 'COMPLETED' | 'NO_SHOW' = 'COMPLETED'
    let reason = 'Session completed successfully'
    
    // If session was never marked as LIVE, it's a no-show
    if (session.status === 'SCHEDULED') {
      finalStatus = 'NO_SHOW'
      reason = 'Tutor never joined the session'
    }
    
    try {
      await atomicUpdateSessionStatus(
        prisma,
        session.id,
        finalStatus,
        session.status as any,
        {
          sessionId: session.id,
          userId: 'system',
          userRole: 'SYSTEM',
        }
      )
        
      console.log('[LiveKit Webhook] Session marked as', finalStatus, ':', session.id)
        
        // Log audit event
        await AuditLogger.logSessionLifecycle(prisma, {
          sessionId: session.id,
          studentId: session.student_id,
          tutorId: session.tutor_id,
          oldStatus: session.status,
          newStatus: finalStatus,
          triggeredBy: 'SYSTEM',
          reason: reason,
        })
      } catch (error) {
        console.error('[LiveKit Webhook] Failed to transition session to final state:', error)
      }
    } catch (error) {
      console.error('[LiveKit Webhook] Failed to handle room finished:', error)
    }
  }
