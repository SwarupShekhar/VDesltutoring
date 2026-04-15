import { prisma } from '@/lib/prisma'
import { getMondayUTC, getEffectivePlan, PLAN_QUOTAS, type Plan } from '@/lib/planConfig'

export interface ResolvedQuota {
  effectivePlan: Plan
  remainingSeconds: number | null   // null = unlimited
  usedSeconds: number
  rolledOverSeconds: number
  weekStartDate: Date
  weeklyLimitSeconds: number | null
  aiCreditsGranted: number
  aiCreditsUsed: number
}

export async function resolveQuota(clerkId: string): Promise<ResolvedQuota> {
  const sub = await prisma.subscription.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, plan: 'FREE', status: 'ACTIVE' },
  })

  const effectivePlan = getEffectivePlan(sub) as Plan
  const config = PLAN_QUOTAS[effectivePlan]

  const quota = await prisma.userQuota.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, weekStartDate: getMondayUTC(new Date()) },
  })

  const currentMonday = getMondayUTC(new Date())
  if (quota.weekStartDate < currentMonday) {
    const weeklyLimit = config.weeklyTutorSeconds
    const unused = weeklyLimit !== null ? Math.max(0, weeklyLimit - quota.freeSecondsUsed) : 0
    const maxRollover = weeklyLimit !== null ? weeklyLimit * config.rolloverWeeks : 0
    const rollover = Math.min(unused, maxRollover)

    await prisma.userQuota.update({
      where: { clerkId },
      data: { freeSecondsUsed: 0, rolledOverSeconds: rollover, weekStartDate: currentMonday },
    })

    quota.freeSecondsUsed = 0
    quota.rolledOverSeconds = rollover
    quota.weekStartDate = currentMonday
  }

  const weeklyLimit = config.weeklyTutorSeconds
  const remaining =
    weeklyLimit === null
      ? null
      : Math.max(0, weeklyLimit - quota.freeSecondsUsed + quota.rolledOverSeconds)

  return {
    effectivePlan,
    remainingSeconds: remaining,
    usedSeconds: quota.freeSecondsUsed,
    rolledOverSeconds: quota.rolledOverSeconds,
    weekStartDate: quota.weekStartDate,
    weeklyLimitSeconds: weeklyLimit,
    aiCreditsGranted: quota.aiCreditsGranted,
    aiCreditsUsed: quota.aiCreditsUsed,
  }
}
