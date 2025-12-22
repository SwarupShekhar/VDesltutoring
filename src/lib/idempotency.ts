import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { NextRequest } from 'next/server'

/**
 * Idempotency System for Critical Operations
 * 
 * Protects against:
 * - Double clicks
 * - Network retries
 * - Mobile client resubmissions
 * 
 * Uses a database-backed approach with expiration for automatic cleanup
 */

// Idempotency record structure
interface IdempotencyRecord {
  id: string
  key: string
  operation: string
  userId: string
  requestDataHash: string
  responseData: any
  statusCode: number
  expiresAt: Date
  createdAt: Date
}

// Configuration
const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key'
const IDEMPOTENCY_KEY_MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours
const IDEMPOTENCY_KEY_REGEX = /^[a-zA-Z0-9-_]{8,128}$/

/**
 * Validates idempotency key format
 * @param key Idempotency key from request header
 * @returns boolean indicating if key is valid
 */
export function validateIdempotencyKey(key: string): boolean {
  if (!key) return false
  return IDEMPOTENCY_KEY_REGEX.test(key)
}

/**
 * Generates a hash of request data for comparison
 * @param data Request body or relevant data
 * @returns SHA-256 hash of the data
 */
export function hashRequestData(data: any): string {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data)
  return crypto.createHash('sha256').update(dataString).digest('hex')
}

/**
 * Checks if an idempotency record exists and is still valid
 * @param prisma Prisma client instance
 * @param key Idempotency key
 * @returns Existing record if found and valid, null otherwise
 */
export async function getIdempotencyRecord(prisma: PrismaClient, key: string) {
  try {
    const record = await (prisma as any).idempotency_records.findUnique({
      where: { key: key }
    })

    // Check if record exists and hasn't expired
    if (record && record.expires_at > new Date()) {
      return record
    }
    
    // Delete expired record if it exists
    if (record) {
      await (prisma as any).idempotency_records.delete({
        where: { key: key }
      })
    }
    
    return null
  } catch (error) {
    // If table doesn't exist or other DB error, treat as no record
    return null
  }
}

/**
 * Creates a new idempotency record
 * @param prisma Prisma client instance
 * @param params Record creation parameters
 * @returns Created record
 */
export async function createIdempotencyRecord(
  prisma: PrismaClient,
  params: {
    key: string
    operation: string
    userId: string
    requestDataHash: string
    responseData: any
    statusCode: number
  }
) {
  try {
    const expiresAt = new Date(Date.now() + IDEMPOTENCY_KEY_MAX_AGE)
    
    return await (prisma as any).idempotency_records.create({
      data: {
        key: params.key,
        operation: params.operation,
        user_id: params.userId,
        request_data_hash: params.requestDataHash,
        response_data: params.responseData,
        status_code: params.statusCode,
        expires_at: expiresAt,
        created_at: new Date()
      }
    })
  } catch (error) {
    // If table doesn't exist, silently fail
    return null
  }
}

/**
 * Idempotency middleware for API routes
 * 
 * Usage:
 * 1. Call at start of POST route handler
 * 2. If returns a response, send it immediately (request already processed)
 * 3. If returns null, continue processing and call saveIdempotencyRecord at the end
 * 
 * @param prisma Prisma client instance
 * @param req Next.js request object
 * @param userId Authenticated user ID
 * @param operation Unique identifier for the operation type
 * @returns Cached response if exists, null if should proceed
 */
export async function handleIdempotency(
  prisma: PrismaClient,
  req: NextRequest,
  userId: string,
  operation: string
) {
  // Only apply to POST requests
  if (req.method !== 'POST') {
    return null
  }

  // Check for idempotency key
  const idempotencyKey = req.headers.get(IDEMPOTENCY_KEY_HEADER)
  
  // If no key provided, proceed without idempotency
  if (!idempotencyKey) {
    return null
  }

  // Validate key format
  if (!validateIdempotencyKey(idempotencyKey)) {
    return {
      status: 400,
      body: {
        error: 'Invalid idempotency key format',
        code: 'INVALID_IDEMPOTENCY_KEY'
      }
    }
  }

  // Try to get existing record
  const existingRecord = await getIdempotencyRecord(prisma, idempotencyKey)
  
  if (existingRecord) {
    // Check if this is the same user and operation
    if (existingRecord.user_id === userId && existingRecord.operation === operation) {
      // Return cached response
      return {
        status: existingRecord.status_code,
        body: existingRecord.response_data
      }
    } else {
      // Key collision - reject request
      return {
        status: 409,
        body: {
          error: 'Idempotency key already used for different request',
          code: 'IDEMPOTENCY_KEY_CONFLICT'
        }
      }
    }
  }

  // No existing record, proceed with request
  return null
}

/**
 * Saves idempotency record after successful request processing
 * @param prisma Prisma client instance
 * @param idempotencyKey Idempotency key from request header
 * @param operation Unique identifier for the operation type
 * @param userId Authenticated user ID
 * @param requestData Request data for hash comparison
 * @param response Response data to cache
 * @param statusCode HTTP status code
 */
export async function saveIdempotencyRecord(
  prisma: PrismaClient,
  idempotencyKey: string,
  operation: string,
  userId: string,
  requestData: any,
  response: any,
  statusCode: number
) {
  try {
    const requestDataHash = hashRequestData(requestData)
    
    await createIdempotencyRecord(prisma, {
      key: idempotencyKey,
      operation: operation,
      userId: userId,
      requestDataHash: requestDataHash,
      responseData: response,
      statusCode: statusCode
    })
  } catch (error) {
    // Silently fail - idempotency is enhancement, not critical
    console.warn('Failed to save idempotency record:', error)
  }
}

/**
 * Helper to extract idempotency key from request
 * @param req Next.js request object
 * @returns Idempotency key or null
 */
export function extractIdempotencyKey(req: NextRequest): string | null {
  return req.headers.get(IDEMPOTENCY_KEY_HEADER) || null
}

/**
 * Generates a standard idempotency key if client doesn't provide one
 * @returns Generated idempotency key
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID()
}