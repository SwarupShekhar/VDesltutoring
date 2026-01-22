
import { analyzeAudioConfidence, DeepgramWord } from "../src/lib/speech/audioConfidenceAnalyzer";

const duration = 10;
const baseWords: DeepgramWord[] = [
    { word: "Hello", start: 0.5, end: 1.0, confidence: 0.9, punctuated_word: "Hello" },
    { word: "this", start: 1.1, end: 1.4, confidence: 0.9, punctuated_word: "this" },
    { word: "is", start: 1.5, end: 1.7, confidence: 0.9, punctuated_word: "is" },
    { word: "a", start: 1.8, end: 1.9, confidence: 0.9, punctuated_word: "a" },
    { word: "test", start: 2.0, end: 2.5, confidence: 0.9, punctuated_word: "test." },
    { word: "I", start: 3.5, end: 3.7, confidence: 0.9, punctuated_word: "I" },
    { word: "speak", start: 3.8, end: 4.2, confidence: 0.9, punctuated_word: "speak" },
    { word: "well", start: 4.3, end: 4.6, confidence: 0.9, punctuated_word: "well" },
    { word: "um", start: 5.5, end: 5.8, confidence: 0.9, punctuated_word: "um" },
    { word: "actually", start: 5.9, end: 6.5, confidence: 0.9, punctuated_word: "actually" }
];

const mislabeledWords: DeepgramWord[] = baseWords.map((w, i) => ({
    ...w,
    word: i === 8 ? "home" : "scrambled_text_" + i, // Mislabeled filler and content
    punctuated_word: i === 8 ? "home" : "scrambled_text_" + i
}));

console.log("--- CASE A: Baseline Speech ---");
const resultA = analyzeAudioConfidence(baseWords, duration);
console.log(`Score: ${resultA.score}, Band: ${resultA.band}`);
console.log(`Recovery Score: ${resultA.metrics.recoveryScore}`);

console.log("\n--- CASE B: Mislabeled Words (Same Timestamps) ---");
const resultB = analyzeAudioConfidence(mislabeledWords, duration);
console.log(`Score: ${resultB.score}, Band: ${resultB.band}`);
console.log(`Recovery Score: ${resultB.metrics.recoveryScore}`);

if (resultA.band === resultB.band) {
    console.log("\n✅ SUCCESS: Confidence band remains stable despite mislabeled words.");
} else {
    console.log("\n❌ FAILURE: Confidence band changed!");
}

const difference = Math.abs(resultA.score - resultB.score);
console.log(`Score difference: ${difference} points`);

if (difference > 10) {
    console.log("❌ CRITICAL: Score fluctuated wildly!");
} else {
    console.log("✅ Stability confirmed.");
}
