
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { updateUserFluencyProfile } from "../src/lib/assessment/updateUserFluencyProfile";

async function auditPipeline() {
    console.log("=== PHASE 1: DATA PIPELINE AUDIT ===\n");

    const TEST_USER_ID = "11111111-1111-1111-1111-111111111111"; // Audit User

    // 1. Setup User
    await prisma.users.upsert({
        where: { id: TEST_USER_ID },
        update: {},
        create: {
            id: TEST_USER_ID,
            email: "audit@englivo.com",
            full_name: "Audit Bot",
            role: "LEARNER"
        }
    });

    // --- 1.1 AI TUTOR FLOW ---
    console.log("\n[1.1] AI Tutor Session Simulation");
    console.log("Input: B2 Level, Medium Confidence, 200 words");

    await updateUserFluencyProfile({
        userId: TEST_USER_ID,
        cefrLevel: "B2",
        fluencyScore: 72,
        confidence: 55,
        confidenceBand: "Medium",
        confidenceExplanation: "Moderate hesitation.",
        pauseRatio: 0.2,
        avgPauseMs: 800,
        midSentencePauseRatio: 0.15,
        wordCount: 200,
        lexicalBlockers: null,
        sourceSessionId: "audit-ai-session-1",
        sourceType: "ai_tutor"
    });

    let profile = await prisma.user_fluency_profile.findUnique({
        where: { user_id: TEST_USER_ID }
    });

    if (profile && profile.cefr_level === "B2" && profile.confidence_band === "Medium") {
        console.log("✅ PASS: AI Tutor updated profile correctly.");
    } else {
        console.error("❌ FAIL: AI Tutor update mismatch.", profile);
    }

    // --- 1.2 LIVE PRACTICE FLOW ---
    console.log("\n[1.2] Live Practice Session Simulation");
    console.log("Input: Strong performance (C1 equivalent scores), High Confidence");

    // Simulating Live Worker Logic
    await updateUserFluencyProfile({
        userId: TEST_USER_ID,
        cefrLevel: "C1", // Worker maps score > 80 to C1
        fluencyScore: 85,
        confidence: 80,
        confidenceBand: "High",
        confidenceExplanation: "Smooth delivery.",
        pauseRatio: 0.1,
        avgPauseMs: 400,
        midSentencePauseRatio: 0.05,
        wordCount: 350,
        lexicalBlockers: null,
        sourceSessionId: "audit-live-session-1",
        sourceType: "live_practice"
    });

    profile = await prisma.user_fluency_profile.findUnique({
        where: { user_id: TEST_USER_ID }
    });

    const audit = profile?.assessment_audit as any;

    if (profile && profile.cefr_level === "C1" && audit?.inputs?.audioMetrics?.confidenceBand === "High") {
        console.log("✅ PASS: Live Practice updated profile correctly.");
    } else {
        console.error("❌ FAIL: Live Practice update mismatch.", profile);
    }

    // --- 1.3 DASHBOARD READ ---
    console.log("\n[1.3] Dashboard Persistence Check");
    if (profile?.cefr_model_version) {
        console.log(`✅ PASS: Version stamped (${profile.cefr_model_version})`);
    } else {
        console.error("❌ FAIL: Missing version stamp");
    }

    if (audit?.gates) {
        console.log(`✅ PASS: Audit trail persisted (${audit.gates.length} gates recorded)`);
    } else {
        console.error("❌ FAIL: Missing audit trail");
    }

    // Cleanup
    // await prisma.users.delete({ where: { id: TEST_USER_ID } });
}

auditPipeline();
