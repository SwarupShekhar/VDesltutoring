import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveQuota } from '@/lib/resolveQuota'
import { getEffectivePlan, PLAN_QUOTAS } from '@/lib/planConfig'
import { apiSuccess, ApiErrors } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return ApiErrors.unauthorized()

  const { sessionId, durationSeconds } = await req.json()

  if (!sessionId || typeof durationSeconds !== 'number' || durationSeconds < 0) {
    return NextResponse.json({ error: 'sessionId and durationSeconds required' }, { status: 400 })
  }

  // Idempotency guard
  const existing = await prisma.processedSession.findUnique({ where: { sessionId } })
  if (existing) {
    const resolved = await resolveQuota(userId)
    return apiSuccess({ data: { alreadyProcessed: true, remainingSeconds: resolved.remainingSeconds } })
  }

  await prisma.$transaction(async (tx) => {
    await tx.processedSession.create({
      data: { sessionId, clerkId: userId, deductedSeconds: durationSeconds },
    })

    const sub = await tx.subscription.findUnique({ where: { clerkId: userId } })
    if (!sub) return

    const effectivePlan = getEffectivePlan(sub)
    if (effectivePlan === 'ENTERPRISE') {
      const org = await tx.organization.findFirst({
        where: { members: { some: { clerkId: userId } } },
      })
      if (org) {
        await tx.organization.update({
          where: { id: org.id },
          data: { poolUsedSeconds: { increment: durationSeconds } },
        })
      }
      return
    }

    const config = PLAN_QUOTAS[effectivePlan]
    const quota = await tx.userQuota.findUnique({ where: { clerkId: userId } })
    if (!quota) return

    const weeklyLimit = config.weeklyTutorSeconds
    const newUsed = weeklyLimit !== null
      ? Math.min(quota.freeSecondsUsed + durationSeconds, weeklyLimit)
      : quota.freeSecondsUsed + durationSeconds

    await tx.userQuota.update({
      where: { clerkId: userId },
      data: { freeSecondsUsed: newUsed },
    })
  })

  const resolved = await resolveQuota(userId)

  // Fire-and-forget Bridge sync (call-end is informational)
  import('@/lib/bridge')
    .then(({ syncPlanToBridge }) => {
      const config = PLAN_QUOTAS[resolved.effectivePlan]
      return syncPlanToBridge(userId, resolved.effectivePlan, config)
    })
    .catch(console.error)

  return apiSuccess({ data: { remainingSeconds: resolved.remainingSeconds, usedSeconds: resolved.usedSeconds } })
}
