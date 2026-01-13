
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

        // Check if session exists and user is part of it
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
            return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 });
        }

        // 1. Mark as ended in DB (if not already)
        if (targetSession.status !== 'ended') {
            await prisma.live_sessions.update({
                where: { id: sessionId },
                data: {
                    status: 'ended',
                    ended_at: new Date()
                }
            });
            console.log(`[Leave] DB: Session ${sessionId} marked as ended by user ${user.id}`);
        }

        // 2. ALWAYS attempt to delete the room from LiveKit to ensure sync
        // We do this even if status was already 'ended' in case a previous deletion failed
        try {
            const { livekit } = await import("@/lib/livekit");
            console.log(`[Leave] LiveKit: Attempting to delete room: ${targetSession.room_name}`);
            await livekit.deleteRoom(targetSession.room_name);
            console.log(`[Leave] LiveKit: Successfully deleted room: ${targetSession.room_name}`);
        } catch (lkError) {
            // Room might already be deleted, which is fine
            console.log(`[Leave] LiveKit: Room ${targetSession.room_name} already gone or could not be deleted.`);
        }

        return NextResponse.json({ success: true, message: "Session ended" });

    } catch (error) {
        console.error("Leave session error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
