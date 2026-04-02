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

        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("mode");


        // 2. Query user with auto-registration/linking logic (Self-Healing)
        let user = await prisma.users.findUnique({
            where: { clerkId },
            include: {
                student_profiles: true,
                tutor_profiles: true,
            }
        });

        if (!user) {
            const { currentUser } = await import('@clerk/nextjs/server');
            const clerkUser = await currentUser();

            if (!clerkUser) {
                console.error("LiveKit Token: User not in DB and Clerk currentUser failed");
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const userEmail = clerkUser.emailAddresses[0]?.emailAddress || '';
            const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'swarupshekhar.vaidikedu@gmail.com';
            const IS_OWNER_ADMIN = userEmail === ADMIN_EMAIL;

            console.log('LiveKit Token Auto-Registration: User not found by Clerk ID. Checking by email:', userEmail);

            // Check if user exists by email
            const existingUserByEmail = await prisma.users.findUnique({
                where: { email: userEmail },
                include: { student_profiles: true, tutor_profiles: true }
            });

            if (existingUserByEmail) {
                console.log('LiveKit Token: Linking new Clerk ID to existing email...');
                user = await prisma.users.update({
                    where: { id: existingUserByEmail.id },
                    data: {
                        clerkId: clerkUser.id,
                        full_name: existingUserByEmail.full_name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                    },
                    include: { student_profiles: true, tutor_profiles: true }
                });
            } else {
                // Truly new user: Create
                console.log('LiveKit Token: Auto-registering new user:', clerkUser.id);
                user = await prisma.users.create({
                    data: {
                        clerkId: clerkUser.id,
                        email: userEmail,
                        full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User',
                        role: IS_OWNER_ADMIN ? 'ADMIN' : 'LEARNER',
                        student_profiles: {
                            create: {
                                credits: IS_OWNER_ADMIN ? 9999 : 10, // Default for new users
                                learning_goals: "Getting started",
                            }
                        }
                    },
                    include: { student_profiles: true, tutor_profiles: true }
                });
            }
        }

        let session = null;
        let roomName = "";

        // MODE: AI TUTOR (Bypass session check)
        if (mode === "ai") {
            roomName = `ai-practice-${user.id}-${Date.now()}`;
        } else {
            // MODE: HUMAN SESSION (Strict Check)
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

            // If no session found → return 403
            if (!session) {
                console.warn(`LiveKit Token: No active session found for user ${user.id} (${user.email})`);
                return NextResponse.json(
                    { error: "No scheduled or live session found" },
                    { status: 403 }
                );
            }

            roomName = `session-${session.id}`;
        }

        // 5. Create LiveKit room (Conceptually)
        // roomName is already set above

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
