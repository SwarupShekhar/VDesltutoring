import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { razorpay, PLAN_TO_RAZORPAY_ID, isPlanHigherOrEqual } from '@/lib/razorpay'
import { getEffectivePlan, type Plan } from '@/lib/planConfig'
import { apiSuccess, ApiErrors } from '@/lib/api-response'

const UPGRADEABLE_PLANS = ['STARTER', 'PRO', 'PREMIUM'] as const

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return ApiErrors.unauthorized()

  const { plan } = await req.json() as { plan: typeof UPGRADEABLE_PLANS[number] }

  if (!UPGRADEABLE_PLANS.includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan. Choose STARTER, PRO, or PREMIUM.' }, { status: 400 })
  }

  const existing = await prisma.subscription.findUnique({ where: { clerkId: userId } })
  if (existing?.status === 'ACTIVE') {
    const currentEffective = getEffectivePlan(existing) as Plan
    if (currentEffective === (plan as Plan)) {
      return NextResponse.json({ error: 'ALREADY_SUBSCRIBED', currentPlan: currentEffective }, { status: 409 })
    }
    if (isPlanHigherOrEqual(currentEffective, plan as Plan)) {
      return NextResponse.json({ error: 'DOWNGRADE_NOT_SUPPORTED', message: 'Contact support to downgrade.' }, { status: 400 })
    }
  }

  let razorpayCustomerId = existing?.razorpayCustomerId ?? null
  if (!razorpayCustomerId) {
    const customer = await razorpay.customers.create({ notes: { clerkId: userId } } as any)
    razorpayCustomerId = customer.id
    await prisma.subscription.upsert({
      where: { clerkId: userId },
      update: { razorpayCustomerId },
      create: { clerkId: userId, plan: 'FREE', status: 'ACTIVE', razorpayCustomerId },
    })
  }

  const subscription = await (razorpay.subscriptions as any).create({
    plan_id: PLAN_TO_RAZORPAY_ID[plan],
    customer_notify: 1,
    quantity: 1,
    total_count: 120,
    notes: { clerkId: userId },
  })

  return apiSuccess({ data: { subscriptionId: subscription.id, shortUrl: subscription.short_url } })
}
