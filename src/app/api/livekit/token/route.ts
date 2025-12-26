import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma'; // Use singleton

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // 1. Use auth() to get logged-in userId (Clerk ID)
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            console.error("LiveKit Token: No Clerk ID found (Unauthorized)");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Query student_profiles and tutor_profiles
        const user = await prisma.users.findUnique({
            where: { clerkId },
            include: {
                student_profiles: true,
                tutor_profiles: true,
            }
        });

        if (!user) {
            console.error(`LiveKit Token: User not found for Clerk ID ${clerkId}`);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3. Query sessions table
        let session = null;
        const validStatuses = ['SCHEDULED', 'LIVE'];

        // If student_profile exists → match sessions.student_id
        if (user.student_profiles) {
            session = await prisma.sessions.findFirst({
                where: {
                    student_id: user.student_profiles.id,
                    status: { in: validStatuses as any },
                },
                orderBy: { start_time: 'asc' },
            });
        }

        // If no student session found, AND tutor_profile exists → match sessions.tutor_id
        if (!session && user.tutor_profiles) {
            session = await prisma.sessions.findFirst({
                where: {
                    tutor_id: user.tutor_profiles.id,
                    status: { in: validStatuses as any },
                },
                orderBy: { start_time: 'asc' },
            });
        }

        // 4. If no session found → return 403
        if (!session) {
            console.warn(`LiveKit Token: No active session found for user ${user.id} (${user.email})`);
            return NextResponse.json(
                { error: "No scheduled or live session found" },
                { status: 403 }
            );
        }

        // 5. Create LiveKit room
        const roomName = `session-${session.id}`;

        // 6. Generate token
        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        const wsUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;

        if (!apiKey || !apiSecret || !wsUrl) {
            console.error("LiveKit Token: Server environment variables missing");
            console.error(`- API_KEY present: ${!!apiKey}`);
            console.error(`- API_SECRET present: ${!!apiSecret}`);
            console.error(`- WS_URL present: ${!!wsUrl}`);

            return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
        }

        const at = new AccessToken(apiKey, apiSecret, {
            identity: user.id,
            name: user.email,
        });

        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
        });

        const token = await at.toJwt();

        // 7. Return JSON
        return NextResponse.json({
            token,
            roomName,
        });

    } catch (error) {
        console.error("LiveKit Token Uncaught Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
