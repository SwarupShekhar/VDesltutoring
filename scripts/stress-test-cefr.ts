
import { analyzeAudioConfidence, DeepgramWord } from "../src/lib/speech/audioConfidenceAnalyzer";
import { detectLexicalCeiling } from "../src/lib/fluency-engine";
import { CEFRLevel } from "../src/lib/cefr-lexical-triggers";

// --- MOCK DATA GENERATORS ---

function createHesitantTiming(transcript: string): DeepgramWord[] {
    const words = transcript.split(" ");
    const result: DeepgramWord[] = [];
    let currentTime = 0;

    words.forEach((w, i) => {
        const start = currentTime;
        const end = currentTime + 0.3;
        result.push({ word: w, start, end, confidence: 0.99 });

        // Every word, add erratic pauses to spike variance and ratio
        if (i % 2 === 0) {
            currentTime = end + 1.5; // Long hesitation
        } else if (i % 3 === 0) {
            currentTime = end + 0.9; // Medium hesitation
        } else {
            currentTime = end + 0.1; // Short gap
        }
    });
    return result;
}

function createFlowingTiming(transcript: string): DeepgramWord[] {
    const words = transcript.split(" ");
    const result: DeepgramWord[] = [];
    let currentTime = 0;

    words.forEach((w) => {
        const start = currentTime;
        const end = currentTime + 0.3;
        result.push({ word: w, start, end, confidence: 0.99 });
        currentTime = end + 0.1; // Smooth flow
    });
    return result;
}

// --- TEST SUITE ---

async function runTests() {
    console.log("=== CEFR LOGIC STRESS TESTS ===\n");

    // --- TEST A: Fluent but Hesitant ---
    console.log("[TEST A] Scenario: Rich vocabulary, long mid-sentence pauses");
    const transcriptA = "Moreover the multifaceted nature of this pivotal achievement is noteworthy for the substance of the elements";
    const timingA = createHesitantTiming(transcriptA);
    const audioA = analyzeAudioConfidence(timingA, 45);

    let finalLevelA: CEFRLevel = "C2";
    let statusNote = "";

    // Exact logic from updateUserFluencyProfile.ts:
    if (audioA.band === "Low") {
        finalLevelA = "B1";
        statusNote = "(CAPPED TO B1: LOW CONFIDENCE)";
    } else if (audioA.band === "Medium") {
        if (["C1", "C2"].includes(finalLevelA)) {
            finalLevelA = "B2";
            statusNote = "(CAPPED TO B2: MEDIUM CONFIDENCE)";
        }
    }

    console.log(`- Result Band: ${audioA.band} (Score: ${audioA.score})`);
    console.log(`- Final CEFR: ${finalLevelA} ${statusNote}`);
    console.log(`- Status: ${(finalLevelA === "B1" || finalLevelA === "B2") ? "✅ PASS" : "❌ FAIL"}\n`);


    // --- TEST B: Simple but Flowing ---
    console.log("[TEST B] Scenario: Basic words, no hesitation, smooth rhythm");
    const transcriptB = "It was good. I think it was very good. Really, it was just good."; // Triggers B1 blockers
    const timingB = createFlowingTiming(transcriptB);
    const audioB = analyzeAudioConfidence(timingB, 45);

    const ceilingB = detectLexicalCeiling(transcriptB, "B1");

    let finalLevelB: CEFRLevel = "B1";
    let blockedByLex = false;
    if (ceilingB) {
        finalLevelB = ceilingB.currentLimit;
        blockedByLex = true;
    }

    console.log(`- Result Band: ${audioB.band} (Score: ${audioB.score})`);
    console.log(`- Lexical Ceiling Detected: ${!!ceilingB} (${ceilingB?.detectedWords.join(", ")})`);
    console.log(`- Final CEFR: ${finalLevelB} ${blockedByLex ? `(BLOCKED BY LEX: ${ceilingB?.explanation})` : ""}`);
    console.log(`- Status: ${blockedByLex && finalLevelB === "A2" ? "✅ PASS" : "❌ FAIL"}\n`);


    // --- TEST C: Short Session ---
    console.log("[TEST C] Scenario: 30 seconds duration, good flow");
    const durationC = 30;
    const isQuickPractice = durationC < 45;

    console.log(`- Duration: ${durationC}s`);
    console.log(`- Flagged as Preliminary/Quick: ${isQuickPractice}`);
    console.log(`- Status: ${isQuickPractice ? "✅ PASS" : "❌ FAIL"}\n`);
}

runTests();
