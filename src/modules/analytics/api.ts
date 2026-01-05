import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { requireRole } from '@/modules/auth'
import { getAnalyticsSummary } from './logic'

export async function handleGetAnalytics(request: Request) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await requireRole(['ADMIN'])
    if (!user) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const data = await getAnalyticsSummary()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: "Analytics Error" }, { status: 500 })
    }
}
