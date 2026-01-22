
interface CEFRLevelGate {
    level: string;
    duration: number;
    wordCount: number;
}

function verifyReliabilityGate(assignedLevel: string, durationVal: number, wordCountVal: number) {
    let targetLevel = assignedLevel;
    let reliabilityReason = "";

    // Step-down logic: Check gates sequentially to allow multiple level drops
    if (targetLevel === "C2" && durationVal < 180 && wordCountVal < 300) {
        targetLevel = "C1";
        reliabilityReason += "C2 requires 3m/300 words. ";
    }

    if (targetLevel === "C1" && durationVal < 120 && wordCountVal < 200) {
        targetLevel = "B2";
        reliabilityReason += "C1 requires 2m/200 words. ";
    }

    if (targetLevel === "B2" && durationVal < 60 && wordCountVal < 100) {
        targetLevel = "B1";
        reliabilityReason += "B2 requires 1m/100 words. ";
    }

    return { targetLevel, reliabilityReason };
}

const testCases = [
    { label: "C2 with 41s (User's case)", assigned: "C2", duration: 41, words: 50, expected: "B1" },
    { label: "C2 with 150s", assigned: "C2", duration: 150, words: 156, expected: "B2" },
    { label: "C1 with 45s", assigned: "C1", duration: 45, words: 50, expected: "B1" },
    { label: "C1 with 150s", assigned: "C1", duration: 150, words: 210, expected: "C1" },
    { label: "C2 with 200s", assigned: "C2", duration: 200, words: 310, expected: "C2" },
    { label: "B2 with 45s", assigned: "B2", duration: 45, words: 50, expected: "B1" },
    { label: "B1 with 30s", assigned: "B1", duration: 30, words: 20, expected: "B1" }, // B1 and below are not capped
];

console.log("--- STARTING ASSESSMENT GATE VERIFICATION ---\n");

let passed = 0;
testCases.forEach(tc => {
    const result = verifyReliabilityGate(tc.assigned, tc.duration, tc.words);
    const success = result.targetLevel === tc.expected;
    if (success) passed++;

    console.log(`[${success ? "PASS" : "FAIL"}] ${tc.label}`);
    console.log(`  Input: ${tc.assigned} | ${tc.duration}s | ${tc.words} words`);
    console.log(`  Output: ${result.targetLevel} ${result.reliabilityReason ? "(" + result.reliabilityReason + ")" : ""}`);
    if (!success) console.log(`  EXPECTED: ${tc.expected}`);
    console.log("");
});

console.log(`\nVERIFICATION COMPLETE: ${passed}/${testCases.length} tests passed.`);
if (passed === testCases.length) {
    console.log("✅ All reliability gating logic is working correctly.");
} else {
    console.log("❌ Some reliability gating logic failed.");
}
