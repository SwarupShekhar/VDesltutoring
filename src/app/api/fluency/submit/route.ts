import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { rounds, average } = body

        if (!rounds || typeof average !== "number") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
        }

        await prisma.fluency_sessions.create({
            data: {
                user_clerk_id: userId,
                average_score: average,
                rounds
            }
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Fluency submit failed", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
