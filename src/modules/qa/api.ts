import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { requireRole } from '@/modules/auth'
import { getQASnapshot } from './logic'

export async function handleGetQATurn(request: Request) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Role check - only ADMIN allowed (or QA if we had that role explicitly, assuming ADMIN covers it)
    const user = await requireRole(['ADMIN'])
    if (!user) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const turnId = searchParams.get('id')

    if (!turnId) {
        return NextResponse.json({ error: "Missing turn ID" }, { status: 400 })
    }

    try {
        const snapshot = await getQASnapshot(turnId)
        return NextResponse.json(snapshot)
    } catch (error) {
        console.error("QA Snapshot Error:", error)
        return NextResponse.json({ error: "Failed to generate snapshot" }, { status: 500 })
    }
}
