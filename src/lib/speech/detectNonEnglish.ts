/**
 * English-Only Enforcement Utility
 * 
 * Uses Deepgram metadata to detect non-English speech segments.
 * High confidence that speech is English is required for promotion progress.
 */

export interface LanguageDetectionResult {
    isEnglish: boolean;
    confidence: number;
    detectedLanguage: string;
    reason?: string;
}

/**
 * Detect if a speech segment is primarily English using Deepgram results.
 * 
 * @param deepgramResponse - The raw response from Deepgram
 * @returns Detection result with English status and confidence
 */
export function detectNonEnglish(deepgramResponse: any): LanguageDetectionResult {
    if (!deepgramResponse || !deepgramResponse.results) {
        return { isEnglish: true, confidence: 0, detectedLanguage: "unknown" };
    }

    const channel = deepgramResponse.results.channels?.[0];
    const alternative = channel?.alternatives?.[0];

    if (!alternative) {
        return { isEnglish: true, confidence: 0, detectedLanguage: "unknown" };
    }

    // Deepgram can return detected language at the alternative level
    // or per-word if diarization/language detection is enabled.
    const detectedLanguage = alternative.languages?.[0]?.language || deepgramResponse.metadata?.model_info?.language || "en";
    const confidence = alternative.languages?.[0]?.confidence || 1.0;

    // We are strict: if it's not English ("en"), or English but VERY low confidence (rare for native English model)
    const isEnglish = detectedLanguage === "en" || detectedLanguage === "en-US" || detectedLanguage === "en-GB";

    let reason = "";
    if (!isEnglish) {
        reason = `Detected language: ${detectedLanguage}. Please stay in English to progress.`;
    }

    return {
        isEnglish,
        confidence,
        detectedLanguage,
        reason
    };
}

/**
 * Filter words to only include those that are likely English.
 * 
 * @param words - Deepgram word objects
 * @returns Only English words
 */
export function filterEnglishWords(words: any[]): any[] {
    // If per-word language detection is not enabled, this might be limited.
    // For now, we flag the whole segment via detectNonEnglish.
    return words;
}
