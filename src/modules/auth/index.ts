/**
 * Auth Module
 * 
 * Authentication and authorization logic.
 */

// Re-export from lib
export { getCurrentUser } from '@/lib/user'
export { requireRole } from '@/lib/require-role'

// Types
export type Role = 'LEARNER' | 'TUTOR' | 'ADMIN'
