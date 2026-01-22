
import { analyzeAudioConfidence, DeepgramWord } from "../src/lib/speech/audioConfidenceAnalyzer";

const duration = 20;

// CASE 1: Successful Filler Bridge (Pause -> "uh" -> Continuation)
const fillerBridge: DeepgramWord[] = [
    { word: "I", start: 0.5, end: 0.7, confidence: 0.9 },
    { word: "want", start: 0.8, end: 1.1, confidence: 0.9 },
    { word: "uh", start: 2.0, end: 2.3, confidence: 0.9 }, // 0.9s pre-gap
    { word: "the", start: 2.4, end: 2.6, confidence: 0.9 }, // 0.1s post-gap (Recovery!)
    { word: "water", start: 2.7, end: 3.2, confidence: 0.9 }
];

// CASE 2: Breakdown (Pause -> "uh" -> Long Pause)
const fillerBreakdown: DeepgramWord[] = [
    { word: "I", start: 0.5, end: 0.7, confidence: 0.9 },
    { word: "want", start: 0.8, end: 1.1, confidence: 0.9 },
    { word: "uh", start: 2.0, end: 2.3, confidence: 0.9 }, // 0.9s pre-gap
    { word: "the", start: 3.5, end: 3.7, confidence: 0.9 }, // 1.2s post-gap (Breakdown!)
    { word: "water", start: 3.8, end: 4.2, confidence: 0.9 }
];

// CASE 3: Natural Sentence Start (Normal Pause)
const normalSpeech: DeepgramWord[] = [
    { word: "I", start: 0.5, end: 0.7, confidence: 0.9 },
    { word: "want", start: 0.8, end: 1.1, confidence: 0.9 },
    { word: "it", start: 1.2, end: 1.4, confidence: 0.9 }
];

const res1 = analyzeAudioConfidence(fillerBridge, duration);
const res2 = analyzeAudioConfidence(fillerBreakdown, duration);

console.log("--- TEST RESULTS ---");
console.log(`Filler Bridge Result: RecoveryScore=${res1.metrics.recoveryScore.toFixed(3)}, Score=${res1.score}`);
console.log(`Filler Breakdown Result: RecoveryScore=${res2.metrics.recoveryScore.toFixed(3)}, Score=${res2.score}`);

if (res1.metrics.recoveryScore > res2.metrics.recoveryScore) {
    console.log("\n✅ SUCCESS: Hybrid Detection works! Bridge > Breakdown.");
} else {
    console.log("\n❌ FAILURE: Recovery detection logic is flawed.");
}

if (res1.score > res2.score) {
    console.log("✅ SUCCESS: Total score reflects flow control.");
} else {
    console.log("❌ FAILURE: Individual scores don't mirror behavior.");
}
