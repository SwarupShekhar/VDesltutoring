import { PrismaClient } from '@prisma/client'

/**
 * Audit Logging System
 * 
 * Tracks critical operations for dispute resolution and debugging:
 * - Credit mutations
 * - Admin overrides
 * - Session lifecycle events
 */

// Audit event types
export type AuditEventType = 
  | 'CREDIT_MUTATION' 
  | 'ADMIN_OVERRIDE' 
  | 'SESSION_LIFECYCLE'
  | 'USER_ACTION'
  | 'SYSTEM_EVENT'

// Audit log entry structure
export interface AuditLogEntry {
  id?: string
  userId?: string
  userType?: 'STUDENT' | 'TUTOR' | 'ADMIN'
  action: string
  eventType: AuditEventType
  resourceId?: string
  resourceType?: string
  details?: any
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

/**
 * Logs an audit event
 * @param prisma Prisma client instance
 * @param entry Audit log entry
 */
export async function logAuditEvent(prisma: PrismaClient, entry: AuditLogEntry) {
  try {
    // Log to console for immediate visibility
    console.log(`[AUDIT] ${entry.eventType} - ${entry.action}`, {
      userId: entry.userId,
      resourceId: entry.resourceId,
      details: entry.details,
      timestamp: entry.timestamp.toISOString()
    })
    
    // Persist to database
    await (prisma as any).audit_logs.create({
      data: {
        user_id: entry.userId,
        user_type: entry.userType,
        action: entry.action,
        event_type: entry.eventType,
        resource_id: entry.resourceId,
        resource_type: entry.resourceType,
        details: entry.details,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        created_at: entry.timestamp
      }
    })
    
  } catch (error) {
    // Never let audit logging failures break the main flow
    console.warn('Failed to log audit event:', error)
  }
}

/**
 * Logs a credit mutation event
 * @param prisma Prisma client instance
 * @param params Credit mutation details
 */
export async function logCreditMutation(
  prisma: PrismaClient,
  params: {
    userId: string
    studentId: string
    amount: number
    balanceBefore: number
    balanceAfter: number
    reason?: string
    adminId?: string
  }
) {
  await logAuditEvent(prisma, {
    userId: params.adminId || params.userId,
    userType: params.adminId ? 'ADMIN' : 'STUDENT',
    action: `Credit ${params.amount > 0 ? 'added' : 'deducted'}: ${Math.abs(params.amount)}`,
    eventType: 'CREDIT_MUTATION',
    resourceId: params.studentId,
    resourceType: 'student_profile',
    details: {
      amount: params.amount,
      balanceBefore: params.balanceBefore,
      balanceAfter: params.balanceAfter,
      reason: params.reason,
      performedByAdmin: !!params.adminId
    },
    timestamp: new Date()
  })
}

/**
 * Logs an admin override event
 * @param prisma Prisma client instance
 * @param params Admin override details
 */
export async function logAdminOverride(
  prisma: PrismaClient,
  params: {
    adminId: string
    action: string
    targetUserId?: string
    targetResourceId?: string
    targetType?: string
    reason?: string
    details?: any
  }
) {
  await logAuditEvent(prisma, {
    userId: params.adminId,
    userType: 'ADMIN',
    action: params.action,
    eventType: 'ADMIN_OVERRIDE',
    resourceId: params.targetResourceId,
    resourceType: params.targetType,
    details: {
      targetUserId: params.targetUserId,
      reason: params.reason,
      ...params.details
    },
    timestamp: new Date()
  })
}

/**
 * Logs a session lifecycle event
 * @param prisma Prisma client instance
 * @param params Session lifecycle details
 */
export async function logSessionLifecycle(
  prisma: PrismaClient,
  params: {
    sessionId: string
    studentId: string
    tutorId: string
    oldStatus?: string
    newStatus: string
    triggeredBy: 'SYSTEM' | 'STUDENT' | 'TUTOR' | 'ADMIN'
    userId?: string
    reason?: string
  }
) {
  await logAuditEvent(prisma, {
    userId: params.userId,
    userType: params.triggeredBy === 'STUDENT' ? 'STUDENT' : 
              params.triggeredBy === 'TUTOR' ? 'TUTOR' : 
              params.triggeredBy === 'ADMIN' ? 'ADMIN' : undefined,
    action: `Session status changed from ${params.oldStatus || 'N/A'} to ${params.newStatus}`,
    eventType: 'SESSION_LIFECYCLE',
    resourceId: params.sessionId,
    resourceType: 'session',
    details: {
      studentId: params.studentId,
      tutorId: params.tutorId,
      oldStatus: params.oldStatus,
      newStatus: params.newStatus,
      triggeredBy: params.triggeredBy,
      reason: params.reason
    },
    timestamp: new Date()
  })
}

/**
 * Logs a user action event
 * @param prisma Prisma client instance
 * @param params User action details
 */
export async function logUserAction(
  prisma: PrismaClient,
  params: {
    userId: string
    userType: 'STUDENT' | 'TUTOR' | 'ADMIN'
    action: string
    resourceId?: string
    resourceType?: string
    details?: any
  }
) {
  await logAuditEvent(prisma, {
    userId: params.userId,
    userType: params.userType,
    action: params.action,
    eventType: 'USER_ACTION',
    resourceId: params.resourceId,
    resourceType: params.resourceType,
    details: params.details,
    timestamp: new Date()
  })
}

// Export logger functions
export const AuditLogger = {
  log: logAuditEvent,
  logCreditMutation,
  logAdminOverride,
  logSessionLifecycle,
  logUserAction
}