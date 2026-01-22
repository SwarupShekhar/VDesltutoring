
/**
 * Audio-First Confidence & Hesitation Analyzer
 * 
 * CORE PRINCIPLE: 
 * Confidence is inferred from audio behavior (timing, pauses, recovery), not grammar or text.
 * Transcription errors should not distort confidence scores.
 */

export interface DeepgramWord {
    word: string;
    start: number;
    end: number;
    confidence: number;
    punctuated_word?: string;
}

export interface AudioConfidenceMetrics {
    avgPauseMs: number;
    midSentencePauseRatio: number;
    pauseVariance: number;
    speechRateWpm: number;
    speechRateVariance: number;
    recoveryScore: number;
}

export type ConfidenceBand = "Low" | "Medium" | "High";

export interface ConfidenceResult {
    score: number;
    band: ConfidenceBand;
    explanation: string;
    metrics: AudioConfidenceMetrics;
    hesitationFlags: {
        midPauseHigh: boolean;
        avgPauseHigh: boolean;
        rhythmUnstable: boolean;
    };
}

/**
 * Main analysis function
 */
export function analyzeAudioConfidence(words: DeepgramWord[], totalDuration: number): ConfidenceResult {
    if (!words || words.length < 2) {
        return createEmptyResult();
    }

    // 1. Extract Pauses
    const pauses: number[] = [];
    let midSentencePauses = 0;

    for (let i = 0; i < words.length - 1; i++) {
        const gap = words[i + 1].start - words[i].end;
        if (gap > 0.25) { // Only count gaps > 250ms as significant pauses
            pauses.push(gap);

            // Text-Agnostic "Hesitation": Any pause between 0.25s and 2.0s
            // Pauses > 2.0s are treated as intentional sentence/turn-taking breaks.
            const isHesitation = gap < 2.0;
            if (isHesitation && gap > 0.7) { // 700ms mid-speech is a strong hesitation indicator
                midSentencePauses++;
            }
        }
    }

    // 2. Compute Basic Metrics
    const avgPause = pauses.length > 0 ? pauses.reduce((a, b) => a + b, 0) / pauses.length : 0;
    const midSentencePauseRatio = pauses.length > 0 ? midSentencePauses / words.length : 0; // Relative to total words for better scaling

    // Pause Variance
    const pauseVariance = computeVariance(pauses, avgPause);

    // 3. Speech Rate Variance (Rolling WPM)
    const rollingWpms = computeRollingWpm(words, totalDuration);
    const avgWpm = rollingWpms.length > 0 ? rollingWpms.reduce((a, b) => a + b, 0) / rollingWpms.length : (words.length / (totalDuration / 60) || 0);
    const speechRateVariance = computeVariance(rollingWpms, avgWpm);

    // 4. Recovery Score
    const recoveryScore = computeRecoveryScore(words, pauses);

    const metrics: AudioConfidenceMetrics = {
        avgPauseMs: Math.round(avgPause * 1000),
        midSentencePauseRatio,
        pauseVariance,
        speechRateWpm: Math.round(avgWpm),
        speechRateVariance,
        recoveryScore
    };

    // 5. Compute Raw Score (0-100)
    // ConfidenceScore = 100 − 35×MidPauseRatio(scaled) − 20×PauseVariance − 20×SpeechRateVariance − 25×(1−RecoveryScore)
    // Scaling MidPauseRatio: if 20% of words are preceded by a mid-sentence long pause, that's very high hesitation.
    const scaledMidPause = Math.min(midSentencePauseRatio / 0.3, 1);

    let rawScore = 100;
    rawScore -= (35 * scaledMidPause);
    rawScore -= (20 * Math.min(pauseVariance, 1));
    rawScore -= (20 * Math.min(speechRateVariance, 1));
    rawScore -= (25 * (1 - recoveryScore));

    const score = Math.max(0, Math.min(100, Math.round(rawScore)));

    // 6. Determine Band
    let band: ConfidenceBand = "Low";
    if (score >= 75) band = "High";
    else if (score >= 50) band = "Medium";

    // 7. Generate Explanation
    const explanation = generateExplanation(metrics, band);

    // 8. Hesitation Flags
    const hesitationFlags = {
        midPauseHigh: scaledMidPause > 0.3,
        avgPauseHigh: avgPause > 0.9,
        rhythmUnstable: speechRateVariance > 0.4
    };

    return {
        score,
        band,
        explanation,
        metrics,
        hesitationFlags
    };
}

/**
 * Recovery behavior: pause -> filler -> continuation = GOOD
 */
function computeRecoveryScore(words: DeepgramWord[], pauses: number[]): number {
    let recoveries = 0;
    let breakdowns = 0;

    const FILLERS = new Set(["um", "uh", "hmm", "ah", "er", "well", "like", "so", "right"]);

    for (let i = 1; i < words.length - 1; i++) {
        const preGap = words[i].start - words[i - 1].end;
        const postGap = words[i + 1].start - words[i].end;
        const currentWord = words[i].word.toLowerCase().replace(/[.,!?]$/, "");
        const isFiller = FILLERS.has(currentWord);

        if (preGap > 0.7) {
            // Significant pause detected.

            // HYBRID RULE 1: Filler Bridge (High signal)
            // Pause -> Filler -> Continuation
            if (isFiller && postGap < 0.5) {
                recoveries += 1.5; // Weight filler-assisted recovery higher
            }
            // HYBRID RULE 2: Natural Recovery
            // Pause -> Any Word -> Continuation
            else if (postGap < 0.4) {
                recoveries++;
            }
            // BREAKDOWN: Pause -> Any Word -> Pause
            else if (postGap > 0.8) {
                breakdowns++;
            }
        }
    }

    return (recoveries + 1) / (recoveries + breakdowns + 2);
}

function computeVariance(arr: number[], mean: number): number {
    if (arr.length < 2 || mean === 0) return 0;
    const squareDiffs = arr.map(v => Math.pow(v - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(avgSquareDiff) / mean; // Relative standard deviation
}

function computeRollingWpm(words: DeepgramWord[], totalDuration: number): number[] {
    const windowSize = 10; // 10 seconds
    const wpms: number[] = [];

    for (let start = 0; start < totalDuration; start += 5) { // Slide every 5s
        const end = start + windowSize;
        const wordsInWindow = words.filter(w => w.start >= start && w.end <= end);
        if (wordsInWindow.length > 0) {
            wpms.push((wordsInWindow.length / windowSize) * 60);
        }
    }
    return wpms;
}

function generateExplanation(m: AudioConfidenceMetrics, band: ConfidenceBand): string {
    if (band === "High") {
        if (m.recoveryScore > 0.6) return "Your speech is automatic and controlled. You recover smoothly when you lose a word.";
        return "Your speech flow is steady and confident with natural pacing.";
    }

    if (band === "Medium") {
        if (m.midSentencePauseRatio > 0.15) return "Your speech is functional, but you often pause mid-sentence to plan your thoughts.";
        if (m.speechRateVariance > 0.3) return "You communicate effectively, though your speech rhythm can be unstable under pressure.";
        return "You display moderate control, with occasional hesitations during complex ideas.";
    }

    // Low
    if (m.midSentencePauseRatio > 0.25) return "You pause frequently mid-sentence. This usually means your brain is translating before speaking.";
    if (m.avgPauseMs > 1200) return "Long silences between thoughts suggest a high cognitive load while producing English.";
    return "Your speech control is currently limited by frequent hesitations and rhythm breaks.";
}

function createEmptyResult(): ConfidenceResult {
    return {
        score: 0,
        band: "Low",
        explanation: "Not enough speech data to analyze confidence.",
        metrics: {
            avgPauseMs: 0,
            midSentencePauseRatio: 0,
            pauseVariance: 0,
            speechRateWpm: 0,
            speechRateVariance: 0,
            recoveryScore: 0
        },
        hesitationFlags: {
            midPauseHigh: false,
            avgPauseHigh: false,
            rhythmUnstable: false
        }
    };
}
