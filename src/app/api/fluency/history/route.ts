import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const sessions = await prisma.fluency_sessions.findMany({
            where: { user_clerk_id: userId },
            orderBy: { created_at: "desc" },
            select: {
                id: true,
                created_at: true,
                average_score: true,
                rounds: true
            }
        })

        return NextResponse.json({ sessions })
    } catch (err) {
        console.error("History error:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
