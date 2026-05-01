import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const internalSecret = req.headers.get("x-internal-secret");
        const isInternal = internalSecret === process.env.BRIDGE_INTERNAL_SECRET;

        let userId = null;
        if (isInternal) {
            userId = "internal_system";
        } else {
            const authData = await auth();
            userId = authData.userId;
        }

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Mock available slots as expected by Task 2
        // In a real app, this would query the DB for tutor availability
        const mockSlots = [];
        const now = new Date();
        for (let i = 1; i <= 5; i++) {
            const startTime = new Date(now.getTime() + (i + 24) * 3600 * 1000); // Starting tomorrow
            const endTime = new Date(startTime.getTime() + 45 * 60 * 1000);
            mockSlots.push({
                id: `slot_${i}`,
                startTime,
                endTime,
                available: true,
                tutorName: "Shared Core Tutor",
                tutorId: "tutor_shared_1"
            });
        }

        return NextResponse.json({ slots: mockSlots });
    } catch (error) {
        console.error("[Bridge Sync] Slots fetching error:", error);
        return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }
}
