import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> } // Correct type for App Router params (Promise in newer Next.js versions or just object usually, but let's handle Promise for safety in latest canary/versions)
) {
    // Await params if needed (Next.js 15+ breaks if you don't, safer to await)
    // Actually, in current stable Next.js 14 it's object, but let's be safe or check version. 
    // Usually `params` is not a promise in 13/14 unless specific edge cases, but let's treat as object for now.
    // Wait, the error "Type 'Promise<{ sessionId: string; }>' is not assignable to type '{ sessionId: string; }'" is common if we type incorrectly.
    // Let's assume standard behavior: params is an object.

    // BUT recent changes in Next 15 make params a promise. Let's check package.json for version?
    // User is on mac, recently updated. I'll just use the `await params` pattern if it's a promise, or just access if not.
    // Actually, safest generic way for server components/routes:
    const { sessionId } = await context.params;

    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const transcripts = await prisma.live_transcripts.findMany({
            where: {
                session_id: sessionId
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

        return NextResponse.json({ transcripts });
    } catch (error) {
        console.error("Error fetching transcripts:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
