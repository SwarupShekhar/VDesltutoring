import { z } from 'zod'

/**
 * ========================================
 * STANDARDIZED ERROR CODES
 * ========================================
 * Prevents frontend guesswork - consistent error handling
 */
export const ErrorCode = {
  // Authentication & Authorization (1xxx)
  UNAUTHORIZED: 'E1001',
  FORBIDDEN: 'E1002',
  USER_NOT_FOUND: 'E1003',
  INVALID_TOKEN: 'E1004',

  // Validation (2xxx)
  INVALID_REQUEST: 'E2001',
  INVALID_TIME_RANGE: 'E2002',
  INVALID_ROLE: 'E2003',
  
  // Business Logic (3xxx)
  INSUFFICIENT_CREDITS: 'E3001',
  TUTOR_NOT_AVAILABLE: 'E3002',
  TIME_SLOT_CONFLICT: 'E3003',
  NO_TUTOR_ASSIGNED: 'E3004',
  CREDITS_BELOW_ZERO: 'E3005',
  
  // Resource Not Found (4xxx)
  STUDENT_NOT_FOUND: 'E4001',
  TUTOR_NOT_FOUND: 'E4002',
  SESSION_NOT_FOUND: 'E4003',
  PACKAGE_NOT_FOUND: 'E4004',
  PROFILE_NOT_FOUND: 'E4005',

  // Conflicts (5xxx)
  DUPLICATE_EMAIL: 'E5001',
  SESSION_ALREADY_EXISTS: 'E5002',

  // Server (9xxx)
  INTERNAL_ERROR: 'E9001',
  DATABASE_ERROR: 'E9002',
} as const

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode]

/**
 * ========================================
 * BASE RESPONSE SCHEMAS
 * ========================================
 */

// Standard error response
export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
})

export type ErrorResponse = z.infer<typeof errorResponseSchema>

// Standard success wrapper
export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  })

/**
 * ========================================
 * COMMON ENTITY SCHEMAS
 * ========================================
 */

// User base
export const userBaseSchema = z.object({
  id: z.string().uuid(),
  clerkId: z.string().nullable(),
  email: z.string().email(),
  fullName: z.string(),
  role: z.enum(['ADMIN', 'TUTOR', 'LEARNER']).nullable(),
  profileImageUrl: z.string().nullable(),
  isActive: z.boolean().nullable(),
  createdAt: z.date().nullable(),
})

// Student profile
export const studentProfileSchema = z.object({
  id: z.string().uuid(),
  credits: z.number().int().min(0),
  primaryTutorId: z.string().uuid().nullable(),
  learningGoals: z.string().nullable(),
})

// Tutor profile
export const tutorProfileSchema = z.object({
  id: z.string().uuid(),
  bio: z.string().nullable(),
  expertiseTags: z.array(z.string()),
  hourlyRateEquivalent: z.number().int().nullable(),
})

// Session base
export const sessionBaseSchema = z.object({
  id: z.string().uuid(),
  startTime: z.date(),
  endTime: z.date(),
  status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  livekitRoomId: z.string().nullable(),
  meetingLink: z.string().nullable(),
  adminNotes: z.string().nullable(),
  createdAt: z.date().nullable(),
})

// Nested user in session
export const sessionUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
})

/**
 * ========================================
 * API ENDPOINT SCHEMAS
 * ========================================
 */

// -------------------- /api/me --------------------
export const meResponseSchema = z.object({
  id: z.string().uuid(),
  clerkId: z.string().nullable(),
  email: z.string().email(),
  fullName: z.string(),
  role: z.enum(['ADMIN', 'TUTOR', 'LEARNER']).nullable(),
  profileImageUrl: z.string().nullable(),
  isActive: z.boolean().nullable(),
  createdAt: z.date().nullable(),
  student: studentProfileSchema.extend({
    nextSession: z.any().nullable(), // Could be further typed
  }).nullable().optional(),
  tutor: tutorProfileSchema.extend({
    upcomingSessions: z.array(z.any()), // Could be further typed
  }).nullable().optional(),
})

export type MeResponse = z.infer<typeof meResponseSchema>

// -------------------- /api/sessions (GET) --------------------
export const getSessionsResponseSchema = z.object({
  sessions: z.array(
    sessionBaseSchema.extend({
      student: sessionUserSchema.nullable(),
      tutor: sessionUserSchema.nullable(),
    })
  ),
  role: z.string(),
})

export type GetSessionsResponse = z.infer<typeof getSessionsResponseSchema>

// -------------------- /api/sessions/book (POST) --------------------
export const bookSessionRequestSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  tutorId: z.string().uuid().optional(),
})

export const bookSessionResponseSchema = z.object({
  success: z.literal(true),
  session: z.object({
    id: z.string().uuid(),
    startTime: z.date(),
    endTime: z.date(),
    status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    tutor: z.object({
      name: z.string().nullable(),
    }),
  }),
})

export type BookSessionRequest = z.infer<typeof bookSessionRequestSchema>
export type BookSessionResponse = z.infer<typeof bookSessionResponseSchema>

// -------------------- /api/sessions/cancel (POST) --------------------
export const cancelSessionRequestSchema = z.object({
  sessionId: z.string().uuid(),
  refundCredits: z.boolean().optional().default(true),
})

export const cancelSessionResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  refunded: z.boolean(),
})

export type CancelSessionRequest = z.infer<typeof cancelSessionRequestSchema>
export type CancelSessionResponse = z.infer<typeof cancelSessionResponseSchema>

// -------------------- /api/sessions/complete (POST) --------------------
export const completeSessionRequestSchema = z.object({
  sessionId: z.string().uuid(),
  status: z.enum(['COMPLETED', 'NO_SHOW']),
  notes: z.string().optional(),
})

export const completeSessionResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  session: z.object({
    id: z.string().uuid(),
    status: z.enum(['COMPLETED', 'NO_SHOW']),
  }),
})

export type CompleteSessionRequest = z.infer<typeof completeSessionRequestSchema>
export type CompleteSessionResponse = z.infer<typeof completeSessionResponseSchema>

// -------------------- /api/admin/adjust-credits (POST) --------------------
export const adjustCreditsRequestSchema = z.object({
  studentId: z.string().uuid(),
  amount: z.number().int(),
  reason: z.string().optional(),
})

export const adjustCreditsResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  student: z.object({
    id: z.string().uuid(),
    credits: z.number().int().min(0),
    adjustment: z.number().int(),
  }),
})

export type AdjustCreditsRequest = z.infer<typeof adjustCreditsRequestSchema>
export type AdjustCreditsResponse = z.infer<typeof adjustCreditsResponseSchema>

// -------------------- /api/admin/assign-tutor (POST) --------------------
export const assignTutorRequestSchema = z.object({
  studentId: z.string().uuid(),
  tutorId: z.string().uuid(),
})

export const assignTutorResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  student: z.object({
    id: z.string().uuid(),
    primaryTutorId: z.string().uuid().nullable(),
  }),
  tutor: z.object({
    id: z.string().uuid(),
    name: z.string().nullable(),
  }),
})

export type AssignTutorRequest = z.infer<typeof assignTutorRequestSchema>
export type AssignTutorResponse = z.infer<typeof assignTutorResponseSchema>

// -------------------- /api/packages/purchase (POST) --------------------
export const purchasePackageRequestSchema = z.object({
  packageId: z.string().uuid(),
})

export const purchasePackageResponseSchema = z.object({
  success: z.literal(true),
  credits: z.number().int().min(0),
  added: z.number().int().positive(),
})

export type PurchasePackageRequest = z.infer<typeof purchasePackageRequestSchema>
export type PurchasePackageResponse = z.infer<typeof purchasePackageResponseSchema>

/**
 * ========================================
 * RESPONSE HELPERS
 * ========================================
 * Type-safe response builders
 */

export const apiResponse = {
  success: <T>(data: T, status = 200) => {
    return { body: { success: true, ...data }, status }
  },

  error: (message: string, code?: ErrorCodeType, status = 500, details?: any) => {
    return {
      body: {
        error: message,
        ...(code && { code }),
        ...(details && { details }),
      },
      status,
    }
  },
}
