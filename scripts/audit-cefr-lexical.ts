
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { updateUserFluencyProfile } from "../src/lib/assessment/updateUserFluencyProfile";
import { detectLexicalCeiling } from "../src/lib/fluency-engine";

async function auditCefrLexical() {
    console.log("=== PHASE 2 & 3: CEFR INTEGRITY & LEXICAL AUDIT ===\n");
    const TEST_USER_ID = "22222222-2222-2222-2222-222222222222";

    // Setup Test User
    await prisma.users.upsert({
        where: { id: TEST_USER_ID },
        update: {},
        create: {
            id: TEST_USER_ID,
            email: "audit-cefr@englivo.com",
            full_name: "CEFR Audit Bot",
            role: "LEARNER"
        }
    });

    // --- 3.1 LEXICAL DETECTION UNIT TEST ---
    console.log("[3.1] Lexical Detection Logic");

    const badTranscript = "It was good. A really good day. The food was good too.";
    const goodTranscript = "It was pleasant. A really substantial day. The cuisine was exquisite.";

    const trigger = detectLexicalCeiling(badTranscript, "B1"); // "good" repeats 3 times

    if (trigger && trigger.count >= 3 && trigger.category === "Vocabulary") {
        console.log(`✅ PASS: Detected repetition of 'good' (${trigger.count} times).`);
    } else {
        console.error("❌ FAIL: Failed to detect lexical ceiling.", trigger);
    }

    const noTrigger = detectLexicalCeiling(goodTranscript, "B1");
    if (!noTrigger) {
        console.log("✅ PASS: No false positives on clean text.");
    } else {
        console.error("❌ FAIL: False positive detected.", noTrigger);
    }

    // --- 2.1 PROMOTION GATES STRESS TEST ---
    console.log("\n[2.1] Promotion Gates Stress Test");

    // Scenario A: Fluent Grammar (C1 Score) but Low Confidence -> Should Cap to B1
    console.log("Testing: C1 Score + Low Confidence -> Expect B1 Cap");
    await updateUserFluencyProfile({
        userId: TEST_USER_ID,
        cefrLevel: "C1",
        fluencyScore: 85,
        confidence: 40,
        confidenceBand: "Low",
        confidenceExplanation: "Frequent pauses.",
        pauseRatio: 0.3,
        wordCount: 300,
        sourceType: "ai_tutor",
        sourceSessionId: "audit-gate-1"
    });

    let profile = await prisma.user_fluency_profile.findUnique({ where: { user_id: TEST_USER_ID } });
    let audit = profile?.assessment_audit as any;

    if (profile?.cefr_level === "B1") {
        console.log("✅ PASS: Confidence Cap enforced (C1 -> B1).");
        if (audit.gates.some((g: any) => g.type === "Confidence")) {
            console.log("✅ PASS: Audit log captures Confidence Gate.");
        } else {
            console.error("❌ FAIL: Audit log missing Confidence Gate.");
        }
    } else {
        console.error(`❌ FAIL: Profile Level is ${profile?.cefr_level}, expected B1.`);
    }

    // Scenario B: C2 Level but Short Session (50 words) -> Should Cap to B1/B2
    // Rule: C2 needs 300 words. C1 needs 200. B2 needs 100.
    // 50 words is < 100, so likely B1.
    console.log("\nTesting: C2 Level + 50 Words -> Expect Cap (Likely B1)");
    await updateUserFluencyProfile({
        userId: TEST_USER_ID,
        cefrLevel: "C2",
        fluencyScore: 95,
        confidence: 90,
        confidenceBand: "High",
        wordCount: 50,
        pauseRatio: 0.1,
        sourceType: "ai_tutor",
        sourceSessionId: "audit-gate-2"
    });

    profile = await prisma.user_fluency_profile.findUnique({ where: { user_id: TEST_USER_ID } });

    if (profile?.cefr_level !== "C2" && ["B1", "A2"].includes(profile?.cefr_level || "")) {
        console.log(`✅ PASS: Duration/WordCount Cap enforced (C2 -> ${profile?.cefr_level}).`);
    } else {
        console.error(`❌ FAIL: Short session allowed C2 badge. Level: ${profile?.cefr_level}`);
    }

    // --- 3.2 PERSISTENCE ---
    console.log("\n[3.2] Lexical Persistence Test");
    // Simulate passing a blocker object
    const blockerObj = {
        level_capped: true,
        category: "Vocabulary",
        explanation: "Stop saying good.",
        detectedWords: ["good"],
        targetLevel: "B1",
        preliminary_level: "A2"
    };

    // Create dummy session for FK constraint with valid UUIDs
    const SESSION_ID = "123e4567-e89b-12d3-a456-426614174000";
    // We need a partner user too, reuse same user or create another to satisfy FK
    // Use the same user for both to be lazy/safe or use a known ID if available.
    // The schema says user_a and user_b are required.
    // Let's just use TEST_USER_ID for both for simplicity as DB likely allows it unless constraint prevents.
    await prisma.live_sessions.upsert({
        where: { id: SESSION_ID },
        update: {},
        create: {
            id: SESSION_ID,
            room_name: "audit-room",
            user_a: TEST_USER_ID,
            user_b: TEST_USER_ID, // Self-talk for audit
            status: "ended"
        }
    });

    await updateUserFluencyProfile({
        userId: TEST_USER_ID,
        cefrLevel: "A2",
        fluencyScore: 45,
        confidence: 60,
        confidenceBand: "Medium",
        wordCount: 200,
        pauseRatio: 0.2,
        lexicalBlockers: blockerObj,
        sourceType: "ai_tutor",
        sourceSessionId: "123e4567-e89b-12d3-a456-426614174000" // Valid UUID
    });

    // Verify written to live_micro_fixes
    const microFix = await prisma.live_micro_fixes.findFirst({
        where: { user_id: TEST_USER_ID, session_id: "123e4567-e89b-12d3-a456-426614174000" }
    });

    if (microFix && microFix.category === "Vocabulary") {
        console.log("✅ PASS: Micro-fix persisted in live_micro_fixes.");
    } else {
        console.error("❌ FAIL: Micro-fix not found.");
    }

    // Cleanup
    // await prisma.users.delete({ where: { id: TEST_USER_ID } });
}

auditCefrLexical();
