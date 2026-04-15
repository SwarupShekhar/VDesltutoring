import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { RAZORPAY_ID_TO_PLAN } from '@/lib/razorpay'
import { syncPlanToBridge } from '@/lib/bridge'
import { PLAN_QUOTAS, type Plan } from '@/lib/planConfig'

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(rawBody) as { event: string; payload: { subscription?: { entity: any } } }
  const entity = event.payload.subscription?.entity
  if (!entity) return NextResponse.json({ ok: true })

  const clerkId: string = entity.notes?.clerkId
  if (!clerkId) {
    console.warn('[Razorpay Webhook] Missing clerkId in notes:', entity.id)
    return NextResponse.json({ ok: true })
  }

  const unixToDate = (ts: number) => new Date(ts * 1000)

  switch (event.event) {
    case 'subscription.activated': {
      const plan: Plan = RAZORPAY_ID_TO_PLAN[entity.plan_id] ?? 'FREE'
      await prisma.subscription.upsert({
        where: { clerkId },
        update: { plan, status: 'ACTIVE', razorpaySubscriptionId: entity.id, currentPeriodEnd: unixToDate(entity.current_end) },
        create: { clerkId, plan, status: 'ACTIVE', razorpaySubscriptionId: entity.id, currentPeriodEnd: unixToDate(entity.current_end) },
      })
      await syncPlanToBridge(clerkId, plan, PLAN_QUOTAS[plan])
      break
    }
    case 'subscription.charged': {
      const plan: Plan = RAZORPAY_ID_TO_PLAN[entity.plan_id] ?? 'FREE'
      await prisma.subscription.update({ where: { clerkId }, data: { status: 'ACTIVE', currentPeriodEnd: unixToDate(entity.current_end) } })
      const aiCredits = PLAN_QUOTAS[plan].monthlyAiCredits
      if (aiCredits > 0) {
        await prisma.userQuota.upsert({
          where: { clerkId },
          update: { aiCreditsGranted: { increment: aiCredits }, creditMonthStart: new Date() },
          create: { clerkId, weekStartDate: new Date(), aiCreditsGranted: aiCredits, creditMonthStart: new Date() },
        })
      }
      await syncPlanToBridge(clerkId, plan, PLAN_QUOTAS[plan])
      break
    }
    case 'subscription.cancelled': {
      await prisma.subscription.update({ where: { clerkId }, data: { status: 'CANCELLED' } })
      await syncPlanToBridge(clerkId, 'FREE', PLAN_QUOTAS['FREE'])
      break
    }
    case 'subscription.halted': {
      await prisma.subscription.update({ where: { clerkId }, data: { status: 'PAST_DUE' } })
      syncPlanToBridge(clerkId, 'FREE', PLAN_QUOTAS['FREE']).catch(console.error)
      break
    }
  }

  return NextResponse.json({ ok: true })
}
