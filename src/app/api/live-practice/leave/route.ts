
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
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }



        // Actually, let's just fetch the user first
        const user = await prisma.users.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const targetSession = await prisma.live_sessions.findFirst({
            where: {
                id: sessionId,
                OR: [
                    { user_a: user.id },
                    { user_b: user.id }
                ]
            }
        });

        if (!targetSession) {
            // Either session doesn't exist or user not in it
            return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 });
        }

        // Mark as ended
        if (targetSession.status !== 'ended') {
            await prisma.live_sessions.update({
                where: { id: sessionId },
                data: {
                    status: 'ended',
                    ended_at: new Date()
                }
            });

            // CRITICAL: Close the LiveKit room so the other partner is also disconnected
            try {
                const { livekit } = await import("@/lib/livekit");
                await livekit.deleteRoom(targetSession.room_name);
                console.log(`[Leave] Closed LiveKit room: ${targetSession.room_name}`);
            } catch (lkError) {
                // Not a fatal error if room already closed
                console.warn(`[Leave] Could not close LiveKit room (may already be closed):`, lkError);
            }
        }

        return NextResponse.json({ success: true, message: "Session ended" });

    } catch (error) {
        console.error("Leave session error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
