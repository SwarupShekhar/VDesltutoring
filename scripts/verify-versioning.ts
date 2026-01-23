import "dotenv/config";
import { updateUserFluencyProfile, CEFR_MODEL_VERSION } from "../src/lib/assessment/updateUserFluencyProfile";
import { prisma } from "../src/lib/prisma";

async function verifyVersioning() {
    console.log("=== CEFR VERSIONING & AUDIT VERIFICATION ===\n");

    const TEST_USER_ID = "00000000-0000-0000-0000-000000000000"; // Mock UUID

    // Ensure test user exists (idempotent)
    await prisma.users.upsert({
        where: { id: TEST_USER_ID },
        update: {},
        create: {
            id: TEST_USER_ID,
            email: "verify-version@example.com",
            full_name: "Version Verify",
            role: "LEARNER"
        }
    });

    console.log(`[TEST] Current Model Version: ${CEFR_MODEL_VERSION}`);

    // Scenario: Capped by Confidence (B2 -> B1)
    console.log("\n[Scenario] Triggering Confidence Cap (B2 -> B1)");
    await updateUserFluencyProfile({
        userId: TEST_USER_ID,
        cefrLevel: "B2",
        fluencyScore: 70,
        confidence: 40,
        confidenceBand: "Low",
        confidenceExplanation: "Frequent long pauses.",
        pauseRatio: 0.35,
        avgPauseMs: 1200,
        midSentencePauseRatio: 0.2,
        wordCount: 150, // Enough for B2 reliability
        sourceSessionId: "verify-session-1",
        sourceType: "ai_tutor"
    });

    // Verify DB State
    const profile = await prisma.user_fluency_profile.findUnique({
        where: { user_id: TEST_USER_ID }
    });

    if (profile) {
        console.log(`- Saved Level: ${profile.cefr_level}`);
        console.log(`- Saved Version: ${profile.cefr_model_version}`);

        const audit = profile.assessment_audit as any;
        console.log("- Audit Gates Captured:");
        audit?.gates?.forEach((g: any) => {
            console.log(`  > ${g.type} Gate: ${g.from} -> ${g.to} (${g.reason})`);
        });

        const pass = profile.cefr_model_version === CEFR_MODEL_VERSION &&
            audit?.gates?.some((g: any) => g.type === "Confidence" && g.to === "B1");

        console.log(`- Verification Status: ${pass ? "✅ PASS" : "❌ FAIL"}`);
    } else {
        console.log("❌ FAIL: Profile not found");
    }

    // Cleanup
    // await prisma.users.delete({ where: { id: TEST_USER_ID } });
}

verifyVersioning();
