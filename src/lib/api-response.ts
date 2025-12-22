import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ErrorCode, type ErrorCodeType } from '@/schemas/api.schema'

/**
 * ========================================
 * TYPE-SAFE API RESPONSE BUILDER
 * ========================================
 * Ensures all responses match contract schemas
 */

interface ApiSuccessOptions<T> {
  data: T
  schema?: z.ZodType<T>
  status?: number
}

interface ApiErrorOptions {
  message: string
  code?: ErrorCodeType
  status?: number
  details?: any
}

/**
 * Build a type-safe success response
 * Optionally validates against schema before sending
 */
export function apiSuccess<T>(options: ApiSuccessOptions<T>) {
  const { data, schema, status = 200 } = options

  // Optional runtime validation in development
  if (process.env.NODE_ENV === 'development' && schema) {
    try {
      schema.parse(data)
    } catch (err) {
      console.error('⚠️  Response schema validation failed:', err)
    }
  }

  return NextResponse.json(data, { status })
}

/**
 * Build a standardized error response with error codes
 */
export function apiError(options: ApiErrorOptions) {
  const { message, code, status = 500, details } = options

  const body: any = { error: message }
  
  if (code) {
    body.code = code
  }
  
  if (details) {
    body.details = details
  }

  return NextResponse.json(body, { status })
}

/**
 * ========================================
 * PREDEFINED ERROR RESPONSES
 * ========================================
 * Common errors with consistent codes and messages
 */

export const ApiErrors = {
  unauthorized: () =>
    apiError({
      message: 'Unauthorized',
      code: ErrorCode.UNAUTHORIZED,
      status: 401,
    }),

  forbidden: (message = 'Forbidden') =>
    apiError({
      message,
      code: ErrorCode.FORBIDDEN,
      status: 403,
    }),

  userNotFound: () =>
    apiError({
      message: 'User not found',
      code: ErrorCode.USER_NOT_FOUND,
      status: 404,
    }),

  invalidRequest: (details?: any) =>
    apiError({
      message: 'Invalid request data',
      code: ErrorCode.INVALID_REQUEST,
      status: 400,
      details,
    }),

  invalidTimeRange: () =>
    apiError({
      message: 'Invalid time range',
      code: ErrorCode.INVALID_TIME_RANGE,
      status: 400,
    }),

  insufficientCredits: () =>
    apiError({
      message: 'Insufficient credits',
      code: ErrorCode.INSUFFICIENT_CREDITS,
      status: 400,
    }),

  tutorNotAvailable: () =>
    apiError({
      message: 'Tutor not available',
      code: ErrorCode.TUTOR_NOT_AVAILABLE,
      status: 400,
    }),

  timeSlotConflict: () =>
    apiError({
      message: 'Time slot not available',
      code: ErrorCode.TIME_SLOT_CONFLICT,
      status: 409,
    }),

  noTutorAssigned: () =>
    apiError({
      message: 'No tutor assigned. Contact admin to assign a primary tutor.',
      code: ErrorCode.NO_TUTOR_ASSIGNED,
      status: 400,
    }),

  creditsBelowZero: () =>
    apiError({
      message: 'Cannot set credits below zero',
      code: ErrorCode.CREDITS_BELOW_ZERO,
      status: 400,
    }),

  studentNotFound: () =>
    apiError({
      message: 'Student not found',
      code: ErrorCode.STUDENT_NOT_FOUND,
      status: 404,
    }),

  tutorNotFound: () =>
    apiError({
      message: 'Tutor not found or inactive',
      code: ErrorCode.TUTOR_NOT_FOUND,
      status: 404,
    }),

  sessionNotFound: () =>
    apiError({
      message: 'Session not found',
      code: ErrorCode.SESSION_NOT_FOUND,
      status: 404,
    }),

  packageNotFound: () =>
    apiError({
      message: 'Package not found',
      code: ErrorCode.PACKAGE_NOT_FOUND,
      status: 404,
    }),

  profileNotFound: (type: 'student' | 'tutor') =>
    apiError({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} profile not found`,
      code: ErrorCode.PROFILE_NOT_FOUND,
      status: 404,
    }),

  internalError: (details?: any) =>
    apiError({
      message: 'Internal server error',
      code: ErrorCode.INTERNAL_ERROR,
      status: 500,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
    }),
}

/**
 * ========================================
 * VALIDATION ERROR HANDLER
 * ========================================
 * Converts Zod errors to API error format
 */

export function handleValidationError(error: z.ZodError) {
  const details = error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }))

  return apiError({
    message: 'Invalid request data',
    code: ErrorCode.INVALID_REQUEST,
    status: 400,
    details,
  })
}
