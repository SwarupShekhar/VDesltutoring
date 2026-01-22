
import { detectLexicalCeiling } from "../src/lib/fluency-engine";
import { CEFRLevel } from "../src/lib/cefr-lexical-triggers";

const testCases = [
    {
        name: "Standard Repetition (good/very good)",
        transcript: "It was good. I think it was very good. Really, it was just good.",
        targetLevel: "B1" as CEFRLevel,
        expectedBlock: true
    },
    {
        name: "Connectors Ceiling (B2)",
        transcript: "I went to the store and then I bought some milk and then I went home and then I cooked dinner.",
        targetLevel: "B2" as CEFRLevel,
        expectedBlock: true
    },
    {
        name: "C1 Nuance Ceiling (really/very)",
        transcript: "I am really happy because it is very important and really interesting. It is very extremely good.",
        targetLevel: "C1" as CEFRLevel,
        expectedBlock: true
    }
];

console.log("--- LEXICAL BLOCKING VERIFICATION --- \n");

testCases.forEach(tc => {
    const result = detectLexicalCeiling(tc.transcript, tc.targetLevel);

    if (!!result === tc.expectedBlock) {
        console.log(`✅ PASS: ${tc.name}`);
        if (result) {
            console.log(`   - Detected: ${result.detectedWords.join(", ")} (Count: ${result.count})`);
            console.log(`   - Explanation: ${result.explanation}`);
            console.log(`   - Capped at: ${result.currentLimit}`);
        }
    } else {
        console.log(`❌ FAIL: ${tc.name}`);
        console.log(`   - Result: ${result ? "Blocked" : "Not Blocked"}`);
    }
});
