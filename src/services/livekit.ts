import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'

/**
 * LiveKit Service for Session Management
 * 
 * Handles LiveKit room creation, token generation, and access control
 */

// Configuration from environment variables
const LIVEKIT_URL = process.env.LIVEKIT_URL || ''
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || ''
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || ''

// Validate configuration
if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.warn('LiveKit configuration incomplete - video sessions will not work')
}

// Room configuration
const ROOM_CONFIG = {
  emptyTimeout: 5 * 60, // 5 minutes
  maxParticipants: 2,    // Just tutor and student
  departureTimeout: 30,  // 30 seconds
}

/**
 * Generate a LiveKit access token for a participant
 * @param params Token generation parameters
 * @returns Access token string
 */
export async function generateLiveKitToken(params: {
  roomId: string
  userId: string
  userName: string
  role: 'tutor' | 'student' | 'admin'
  metadata?: Record<string, any>
}): Promise<string> {
  // Validate configuration
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error('LiveKit configuration incomplete')
  }

  // Create access token
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: params.userId,
    name: params.userName,
    metadata: JSON.stringify({
      role: params.role,
      sessionId: params.roomId,
      ...params.metadata
    })
  })

  // Set token expiration (2 hours should be more than enough for any session)
  at.ttl = '2h'

  // Grant permissions based on role
  switch (params.role) {
    case 'tutor':
      at.addGrant({
        room: params.roomId,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      })
      break

    case 'student':
      at.addGrant({
        room: params.roomId,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      })
      break

    case 'admin':
      at.addGrant({
        room: params.roomId,
        roomJoin: true,
        canPublish: false, // Admin can observe but not publish
        canSubscribe: true,
        canPublishData: false,
        hidden: true, // Admin is hidden from participants
      })
      break

    default:
      throw new Error('Invalid role')
  }

  return await at.toJwt()
}

/**
 * Create a LiveKit room for a session
 * @param sessionId Session ID to use as room name
 * @returns Room ID (same as session ID)
 */
export async function createLiveKitRoom(sessionId: string): Promise<string> {
  // Validate configuration
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error('LiveKit configuration incomplete')
  }

  try {
    const roomClient = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)

    // Create room with session ID as room name
    await roomClient.createRoom({
      name: sessionId,
      emptyTimeout: ROOM_CONFIG.emptyTimeout,
      maxParticipants: ROOM_CONFIG.maxParticipants,
      departureTimeout: ROOM_CONFIG.departureTimeout,
    })

    return sessionId
  } catch (error) {
    console.error('Failed to create LiveKit room:', error)
    throw error
  }
}

/**
 * Delete a LiveKit room (cleanup)
 * @param roomId Room ID to delete
 */
export async function deleteLiveKitRoom(roomId: string): Promise<void> {
  // Validate configuration
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return // Nothing to do if not configured
  }

  try {
    const roomClient = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
    await roomClient.deleteRoom(roomId)
  } catch (error) {
    console.warn('Failed to delete LiveKit room:', error)
    // Don't throw - this is cleanup and shouldn't break the flow
  }
}

/**
 * Validate session access for LiveKit
 * @param sessionId Session ID
 * @param userId User ID
 * @param userRole User role
 * @param sessionStartTime Session start time
 * @param sessionEndTime Session end time
 * @returns Validation result
 */
export function validateSessionAccess(params: {
  sessionId: string
  userId: string
  userRole: string
  sessionStartTime: Date
  sessionEndTime: Date
}): { valid: boolean; reason?: string } {
  const now = new Date()

  // Check if session is in the future (too early) - Allow joining 15 minutes early
  const earlyAccessTime = new Date(params.sessionStartTime.getTime() - 15 * 60 * 1000)

  if (now < earlyAccessTime) {
    const minutesUntilStart = Math.ceil((params.sessionStartTime.getTime() - now.getTime()) / (1000 * 60))
    return {
      valid: false,
      reason: `Session starts in ${minutesUntilStart} minutes`
    }
  }

  // Check if session is already ended
  if (now > params.sessionEndTime) {
    return {
      valid: false,
      reason: 'Session has already ended'
    }
  }

  // Check role validity
  if (!['ADMIN', 'TUTOR', 'LEARNER'].includes(params.userRole)) {
    return {
      valid: false,
      reason: 'Invalid user role'
    }
  }

  return { valid: true }
}

// Export service functions
export const LiveKitService = {
  generateToken: generateLiveKitToken,
  createRoom: createLiveKitRoom,
  deleteRoom: deleteLiveKitRoom,
  validateAccess: validateSessionAccess
}