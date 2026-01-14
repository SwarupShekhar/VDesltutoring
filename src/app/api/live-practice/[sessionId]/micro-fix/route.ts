import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
    req: Request,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's database ID
        const user = await prisma.users.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const sessionId = params.sessionId;

        // Get the most recent micro-fix for this user in this session
        const microFix = await prisma.live_micro_fixes.findFirst({
            where: {
                session_id: sessionId,
                user_id: user.id
            },
            orderBy: {
                created_at: "desc"
            }
        });

        if (!microFix) {
            return NextResponse.json({ microFix: null });
        }

        return NextResponse.json({
            microFix: {
                id: microFix.id,
                category: microFix.category,
                detectedWords: microFix.detected_words,
                upgrades: microFix.upgrades,
                explanation: microFix.explanation,
                targetLevel: microFix.target_level,
                currentLimit: microFix.current_limit,
                createdAt: microFix.created_at
            }
        });
    } catch (error) {
        console.error("Error fetching micro-fix:", error);
        return NextResponse.json(
            { error: "Failed to fetch micro-fix" },
            { status: 500 }
        );
    }
}
