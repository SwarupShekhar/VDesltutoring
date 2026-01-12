
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { sessionId, reason } = body;

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        // 1. Get current user DB ID
        const reporter = await prisma.users.findUnique({
            where: { clerkId: userId }
        });

        if (!reporter) {
            return NextResponse.json({ error: "Reporter not found" }, { status: 404 });
        }

        // 2. Find session to identify the reported user
        const session = await prisma.live_sessions.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Determine who is being reported (the OTHER user)
        let reportedUserId = null;
        if (session.user_a === reporter.id) {
            reportedUserId = session.user_b;
        } else if (session.user_b === reporter.id) {
            reportedUserId = session.user_a;
        } else {
            return NextResponse.json({ error: "You are not in this session" }, { status: 403 });
        }

        // 3. Log the report
        // We use audit_logs as a lightweight report table for MVP
        await prisma.audit_logs.create({
            data: {
                user_id: reporter.id,
                user_type: "LEARNER",
                action: "REPORT_USER",
                event_type: "SAFETY",
                resource_id: reportedUserId,
                resource_type: "USER",
                details: {
                    sessionId: session.id,
                    reason: reason || "Unspecified",
                    timestamp: new Date().toISOString()
                },
                ip_address: req.headers.get("x-forwarded-for") || "unknown",
                user_agent: req.headers.get("user-agent") || "unknown"
            }
        });

        return NextResponse.json({ success: true, message: "Report submitted" });

    } catch (error) {
        console.error("Report error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
