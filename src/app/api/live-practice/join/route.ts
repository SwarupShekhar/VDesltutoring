import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { livekit, createToken } from "@/lib/livekit";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get internal user ID (ensure user exists in our DB)
        const dbUser = await prisma.users.findUnique({
            where: { clerkId: userId },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        const body = await req.json();
        const { goal, fluency_score } = body;

        if (!goal || fluency_score === undefined) {
            return NextResponse.json(
                { error: "Missing required fields: goal, fluency_score" },
                { status: 400 }
            );
        }

        // 2. Check if user is already in an active session (REJOIN LOGIC)
        // CRITICAL FIX: Verify the session is *actually* active in LiveKit.
        // The DB might say 'live', but verify existing room state.
        let existingSession = await prisma.live_sessions.findFirst({
            where: {
                OR: [
                    { user_a: dbUser.id },
                    { user_b: dbUser.id }
                ],
                status: { in: ['waiting', 'live'] }
            },
            include: {
                user_a_rel: true,
                user_b_rel: true
            }
        });

        if (existingSession) {
            // Lazy Cleanup: Check LiveKit for truth
            try {
                const roomName = existingSession.room_name;
                const participants = await livekit.listParticipants(roomName);

                // Ghost Logic Refined:
                // 1. If 0 participants, it's dead.
                // 2. If 1 participant (the user themselves or just the partner waiting forever?), 
                //    we need to decide if this is a 'stuck' session.

                // If it's the SAME matched pair, and they are trying to rejoin:
                // If participants.length === 0 -> Dead. End it.
                // If participants.length === 1 -> Is it the *other* person waiting? If so, rejoin is valid.
                // But if the session started long ago (> 2 minutes) and still only 1 person, maybe better to kill?

                const sessionAge = new Date().getTime() - new Date(existingSession.started_at).getTime();
                const isOld = sessionAge > 2 * 60 * 1000; // 2 minutes

                if (participants.length === 0) {
                    console.log(`[Join] Found ghost session ${existingSession.id} (empty). Ending.`);
                    await prisma.live_sessions.update({
                        where: { id: existingSession.id },
                        data: { status: 'ended', ended_at: new Date() }
                    });
                    existingSession = null;
                } else if (participants.length < 2 && isOld) {
                    // Stale session with just 1 person hanging on?
                    // Let's kill it so they can find a NEW partner.
                    console.log(`[Join] Found stale session ${existingSession.id} (1 participant, old). Ending.`);
                    await prisma.live_sessions.update({
                        where: { id: existingSession.id },
                        data: { status: 'ended', ended_at: new Date() }
                    });
                    // Also, we might want to KICK the existing participant from that room?
                    // await livekit.deleteRoom(roomName); 
                    existingSession = null;
                } else {
                    // Valid active session (or recently started), let them rejoin
                    const token = await createToken(roomName, dbUser.id);

                    return NextResponse.json({
                        matched: true,
                        sessionId: existingSession.id,
                        roomName: existingSession.room_name,
                        token,
                        partner: existingSession.user_a === dbUser.id ? existingSession.user_b_rel : existingSession.user_a_rel,
                        isRestored: true
                    });
                }
            } catch (e) {
                if (existingSession) {
                    // If room not found error
                    await prisma.live_sessions.update({
                        where: { id: existingSession.id },
                        data: { status: 'ended', ended_at: new Date() }
                    });
                    existingSession = null;
                }
            }
        }

        // If we killed the ghost session above, existingSession is null, so we proceed to normal queueing.


        // 3. ATOMIC MATCHING & IDEMPOTENT QUEUEING
        // We use a transaction to ensure no race conditions.
        // 3. ATOMIC MATCHING & IDEMPOTENT QUEUEING
        // We use a transaction to ensure no race conditions.
        const matchResult = await prisma.$transaction(async (tx) => {
            // A. Check if user is already in queue (Idempotency)
            // We use upsert so repeated calls just update the timestamp/state, not create duplicates
            await tx.live_queue.upsert({
                where: { user_id: dbUser.id }, // Now works because user_id is unique
                update: { joined_at: new Date() },
                create: {
                    user_id: dbUser.id,
                    goal: goal || "General Practice",
                    fluency_score: fluency_score || 0
                }
            });

            // B. Look for a partner (Atomic Match)
            // Find someone else who is NOT me, and has been waiting
            const partnerEntry = await tx.live_queue.findFirst({
                where: {
                    user_id: { not: dbUser.id },
                },
                orderBy: { joined_at: 'asc' } // FIFO
            });

            if (partnerEntry) {
                // MATCH FOUND!
                const roomName = `live-${dbUser.id}-${partnerEntry.user_id}-${Date.now()}`;

                const newSession = await tx.live_sessions.create({
                    data: {
                        user_a: dbUser.id,
                        user_b: partnerEntry.user_id,
                        room_name: roomName,
                        status: 'waiting',
                        started_at: new Date()
                    }
                });

                await tx.live_queue.deleteMany({
                    where: {
                        user_id: { in: [dbUser.id, partnerEntry.user_id] }
                    }
                });

                return { matched: true, session: newSession, partnerId: partnerEntry.user_id };
            } else {
                return { matched: false, session: null, partnerId: null };
            }
        });

        if (matchResult && matchResult.matched && matchResult.session && matchResult.partnerId) {
            // Generate token and return success
            const token = await createToken(matchResult.session.room_name, dbUser.id);

            // Fetch partner details for UI
            const partner = await prisma.users.findUnique({ where: { id: matchResult.partnerId } });

            return NextResponse.json({
                matched: true,
                sessionId: matchResult.session.id,
                roomName: matchResult.session.room_name,
                token,
                partner: partner,
                isNewMatch: true
            });
        } else {
            // Still waiting
            return NextResponse.json({
                waiting: true,
                message: "Added to queue, waiting for partner..."
            });
        }
    } catch (error) {
        console.error("Error in /live-practice/join:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
