import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        const user = await currentUser()

        if (!userId || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { rounds, averageScore } = await req.json()

        if (!rounds || !Array.isArray(rounds)) {
            return NextResponse.json({ error: "Invalid rounds data" }, { status: 400 })
        }

        // Save to DB
        // Check if user exists in our DB (self-healing logic similar to dashboard)
        let dbUser = await prisma.users.findUnique({ where: { clerkId: userId } })

        if (!dbUser) {
            // Create user if missing
            dbUser = await prisma.users.create({
                data: {
                    clerkId: userId,
                    email: user.emailAddresses[0].emailAddress,
                    full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    role: 'LEARNER'
                }
            })
            // Create profile
            await prisma.student_profiles.create({
                data: {
                    user_id: dbUser.id,
                    credits: 10
                }
            })
        }

        const session = await prisma.fluency_sessions.create({
            data: {
                user_clerk_id: userId,
                average_score: averageScore,
                rounds: rounds // Stores the JSON array of 5 turns
            }
        })

        return NextResponse.json({ success: true, sessionId: session.id })

    } catch (error) {
        console.error("Failed to save session:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
