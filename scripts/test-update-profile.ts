import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

// Setup Prisma manually for the script context
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mock the prisma export that updateUserFluencyProfile imports
// Since we can't easily mock the module import in this script without extensive setup,
// we will rely on updateUserFluencyProfile importing its own prisma instance.
// However, since that instance might not be initialized with the adapter in the script context,
// this might be tricky.
// Actually, `src/lib/prisma.ts` usually initializes Global prisma. 
// If that uses standard init, it might fail if adapter is required.

// Let's first try running it. If it fails due to prisma client, we know the issue.

async function updateUserFluencyProfile({
    userId,
    cefrLevel,
    fluencyScore,
    confidence,
    pauseRatio,
    wordCount,
    lexicalBlockers,
    sourceSessionId,
    sourceType,
}: {
    userId: string;
    cefrLevel: string;
    fluencyScore: number;
    confidence: number;
    pauseRatio: number;
    wordCount: number;
    lexicalBlockers?: any;
    sourceSessionId: string;
    sourceType: "ai_tutor" | "live_practice" | "debug_script"; // Added debug_script for test
}) {
    console.log(`[FluencyProfile] Processing update for ${userId}`);

    // Clerk ID Resolution
    let targetUserId = userId;
    if (userId.startsWith('user_')) {
        const user = await prisma.users.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });
        if (user) {
            targetUserId = user.id;
            console.log(`[FluencyProfile] Resolved Clerk ID ${userId} to Internal UUID ${targetUserId}`);
        } else {
            console.warn(`[FluencyProfile] Warning: Could not resolve Clerk ID ${userId} to internal user.`);
            return; // Abort if user not found, don't write to wrong ID
        }
    }

    console.log(`[FluencyProfile] Updating profile for ${targetUserId} from ${sourceType}`);

    try {
        const result = await (prisma as any).user_fluency_profile.upsert({
            where: { user_id: targetUserId },
            update: {
                cefr_level: cefrLevel,
                fluency_score: fluencyScore,
                confidence: confidence,
                pause_ratio: pauseRatio,
                word_count: wordCount,
                lexical_blockers: lexicalBlockers,
                source_session_id: sourceSessionId,
                source_type: sourceType,
            },
            create: {
                user_id: targetUserId,
                cefr_level: cefrLevel,
                fluency_score: fluencyScore,
                confidence: confidence,
                pause_ratio: pauseRatio,
                word_count: wordCount,
                lexical_blockers: lexicalBlockers,
                source_session_id: sourceSessionId,
                source_type: sourceType,
            },
        });
        console.log("Upsert Result:", result);
    } catch (e) {
        console.error("Upsert Failed:", e);
        throw e;
    }
}

async function main() {
    const targetClerkId = "user_373Ntp0GbbZSPtaVfRbUB6iljql"; // Holden Smith

    console.log("Testing updateUserFluencyProfile for Clerk ID:", targetClerkId);

    try {
        await updateUserFluencyProfile({
            userId: targetClerkId,
            cefrLevel: "B2",
            fluencyScore: 85,
            confidence: 90,
            pauseRatio: 0.1,
            wordCount: 150,
            lexicalBlockers: null,
            sourceSessionId: "manual-test-session",
            sourceType: "ai_tutor"
        });
        console.log("SUCCESS: Function returned without error.");
    } catch (e) {
        console.error("FAILURE: Function threw error:", e);
    }
}

main();
