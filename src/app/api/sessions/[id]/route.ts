import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sessionId = params.id;

        // Fetch the session with student details
        const session = await prisma.sessions.findUnique({
            where: { id: sessionId },
            include: {
                student_profiles: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                full_name: true,
                                email: true
                            }
                        }
                    }
                },
                tutor_profiles: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                full_name: true
                            }
                        }
                    }
                }
            }
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: session.id,
            status: session.status,
            startTime: session.start_time,
            endTime: session.end_time,
            studentId: session.student_profiles?.users?.id || null,
            studentName: session.student_profiles?.users?.full_name || "Student",
            tutorId: session.tutor_profiles?.users?.id || null,
            tutorName: session.tutor_profiles?.users?.full_name || null,
            roomId: session.livekit_room_id
        });
    } catch (error) {
        console.error("Error fetching session:", error);
        return NextResponse.json(
            { error: "Failed to fetch session" },
            { status: 500 }
        );
    }
}
