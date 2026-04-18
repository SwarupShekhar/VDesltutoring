import Razorpay from 'razorpay'
import type { Plan } from '@/lib/planConfig'

// Build-time safety: Provide dummy values if environment variables are missing
// Next.js often tries to execute these modules during static analysis or SSR collection.
const key_id = process.env.RAZORPAY_KEY_ID || 'dummy_id'
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'

export const razorpay = new Razorpay({
  key_id,
  key_secret,
})

export const PLAN_TO_RAZORPAY_ID: Record<string, string> = {
  STARTER: 'core_starter_monthly',
  PRO: 'core_pro_monthly',
  PREMIUM: 'core_premium_monthly',
}

export const RAZORPAY_ID_TO_PLAN: Record<string, Plan> = {
  core_starter_monthly: 'STARTER',
  core_pro_monthly: 'PRO',
  core_premium_monthly: 'PREMIUM',
}

const PLAN_ORDER: Plan[] = ['FREE', 'STARTER', 'PRO', 'PREMIUM', 'ENTERPRISE']

export function isPlanHigherOrEqual(a: Plan, b: Plan): boolean {
  return PLAN_ORDER.indexOf(a) >= PLAN_ORDER.indexOf(b)
}
