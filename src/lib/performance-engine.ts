/**
 * Spoken Performance Intelligence Engine
 * 
 * Multi-layer analysis of cognitive, linguistic, and behavioral speaking performance.
 * Moves beyond basic ESL scoring into professional communication analytics.
 */

import { CEFR_WORDLISTS, VERB_SOPHISTICATION, CONNECTORS } from '@/lib/cefr/cefr-wordlists';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TranscriptSegment {
    text: string;
    timestamp: Date;
    userId: string;
    wordData?: any;
}

export interface PerformanceMetrics {
    speakingTime: number;
    wordCount: number;
    fillerCount: number;
    grammarErrors: number;
    speechRate: number;
}

export interface PerformanceAnalytics {
    cognitiveReflex: CognitiveReflexScore;
    speechRhythm: SpeechRhythmScore;
    languageMaturity: LanguageMaturityScore;
    socialPresence: SocialPresenceScore;
    pressureStability: PressureStabilityScore;
    fillerIntelligence: FillerIntelligenceData;
    performanceDiagnosis: string;
    coachInsights: string[];
    // Phase 2: Coaching Intelligence
    primaryLimiter: PrimaryLimiter;
    nextFocus: NextFocus;
    performanceMoments: PerformanceMoments;
}

export interface CognitiveReflexScore {
    score: number; // 0-100
    avgTimeToFirstWord: number; // seconds
    struggleFillerRate: number; // per minute
    longPauseCount: number;
    insight: string;
}

export interface SpeechRhythmScore {
    score: number; // 0-100
    wpmVariance: number;
    stabilityIndex: number; // 0-100, higher = more stable
    rhythmCurve: Array<{ time: number; wpm: number; label?: string }>;
    insight: string;
}

export interface LanguageMaturityScore {
    score: number; // 0-100
    cefrLevel: string;
    lexicalMaturityIndex: number; // 0-100
    verbSophistication: number; // 0-100
    connectorComplexity: number; // 0-100
    insight: string;
}

export interface SocialPresenceScore {
    score: number; // 0-100
    talkTimeRatio: number; // 0-1
    silenceSurrenderCount: number;
    interruptionRecoveryRate: number; // 0-1
    insight: string;
}

export interface PressureStabilityScore {
    score: number; // 0-100
    baselineScore: number;
    highLoadScore: number;
    degradationBySkill: {
        reflex: number;
        grammar: number;
        rhythm: number;
    };
    insight: string;
}

export interface FillerIntelligenceData {
    struggleSignals: { word: string; count: number }[];
    discourseMarkers: { word: string; count: number }[];
    totalStruggle: number;
    totalDiscourse: number;
    insight: string;
}

// ============================================================================
// PHASE 2: COACHING INTELLIGENCE LAYERS
// ============================================================================

export interface PrimaryLimiter {
    system: string; // e.g., "cognitiveReflex"
    label: string; // e.g., "Cognitive Reflex"
    score: number;
    insight: string;
}

export interface NextFocus {
    system: string;
    target: string; // What to improve
    action: string; // How to improve it
}

export interface PerformanceMoments {
    bestMoment: string | null; // Timestamp like "02:14"
    confidenceDrop: string | null; // Timestamp like "04:38"
    bestMomentContext?: string;
    dropContext?: string;
}

// ============================================================================
// P2P COACHING FEEDBACK LAYER
// ============================================================================

export interface CoachingFeedback {
    performanceSummary: string;        // "Your ideas were clear, but hesitation reduced confidence"
    performanceImpact: ImpactArea[];   // Table data: Area, What Happened, Effect
    patternInsight: string | null;     // "You begin sentences before forming full structure"
    hesitationSignals: {
        longPauses: number;
        restarts: number;
        fillers: number;
    };
    nextBreakthrough: {
        target: string;
        action: string;
    };
    performanceMoments: {
        strongest: string | null;
        drop: string | null;
    };
}

export interface ImpactArea {
    area: string;           // "Fluency", "Grammar", "Vocabulary"
    whatHappened: string;   // "Frequent restarts"
    effect: string;         // "Sounds unsure"
}

// ============================================================================
// FILLER CATEGORIZATION
// ============================================================================

const STRUGGLE_SIGNALS = ['um', 'uh', 'umm', 'uhh', 'er', 'err', 'ah', 'ehh'];
const DISCOURSE_MARKERS = [
    'you know', 'i mean', 'like', 'sort of', 'kind of',
    'actually', 'basically', 'literally', 'right'
];

// ============================================================================
// CORE ANALYSIS ENGINE
// ============================================================================

export class PerformanceEngine {
    /**
     * Main analysis function
     */
    static analyze(
        transcript: TranscriptSegment[],
        metrics: PerformanceMetrics,
        sessionDuration: number // seconds
    ): PerformanceAnalytics {
        const cognitiveReflex = this.analyzeCognitiveReflex(transcript, metrics, sessionDuration);
        const speechRhythm = this.analyzeSpeechRhythm(transcript, metrics, sessionDuration);
        const languageMaturity = this.analyzeLanguageMaturity(transcript, metrics);
        const socialPresence = this.analyzeSocialPresence(transcript, sessionDuration);
        const fillerIntelligence = this.analyzeFillerIntelligence(transcript, sessionDuration);

        // Pressure stability requires complexity detection (simplified for now)
        const pressureStability = this.analyzePressureStability(
            cognitiveReflex,
            speechRhythm,
            languageMaturity
        );

        const performanceDiagnosis = this.generateDiagnosis({
            cognitiveReflex,
            speechRhythm,
            languageMaturity,
            socialPresence,
            pressureStability
        });

        const coachInsights = this.generateCoachInsights({
            cognitiveReflex,
            speechRhythm,
            languageMaturity,
            socialPresence,
            fillerIntelligence
        });

        // ====================================================================
        // PHASE 2: COACHING INTELLIGENCE LAYERS
        // ====================================================================

        const primaryLimiter = this.determinePrimaryLimiter({
            cognitiveReflex,
            speechRhythm,
            languageMaturity,
            socialPresence,
            pressureStability
        });

        const nextFocus = this.determineNextFocus(primaryLimiter.system);

        const performanceMoments = this.detectPerformanceMoments(transcript, cognitiveReflex, speechRhythm);

        return {
            cognitiveReflex,
            speechRhythm,
            languageMaturity,
            socialPresence,
            pressureStability,
            fillerIntelligence,
            performanceDiagnosis,
            coachInsights,
            primaryLimiter,
            nextFocus,
            performanceMoments
        };
    }

    // ========================================================================
    // COGNITIVE REFLEX ANALYSIS
    // ========================================================================

    static analyzeCognitiveReflex(
        transcript: TranscriptSegment[],
        metrics: PerformanceMetrics,
        sessionDuration: number
    ): CognitiveReflexScore {
        // Calculate Time To First Word (TTFW)
        const responseDelays: number[] = [];
        let longPauseCount = 0;

        for (let i = 1; i < transcript.length; i++) {
            const prev = transcript[i - 1];
            const curr = transcript[i];

            // If speaker changed, measure delay
            if (prev.userId !== curr.userId) {
                const delay = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000;
                responseDelays.push(delay);

                if (delay > 1.5) {
                    longPauseCount++;
                }
            }
        }

        const avgTimeToFirstWord = responseDelays.length > 0
            ? responseDelays.reduce((a, b) => a + b, 0) / responseDelays.length
            : 0;

        // Calculate struggle filler rate
        const struggleFillerRate = this.countStruggleFillers(transcript) / (sessionDuration / 60);

        // Score calculation
        let score = 100;

        // Penalize slow responses (ideal <1s)
        if (avgTimeToFirstWord > 1.0) {
            score -= Math.min((avgTimeToFirstWord - 1.0) * 20, 40);
        }

        // Penalize struggle fillers (ideal <2/min)
        if (struggleFillerRate > 2) {
            score -= Math.min((struggleFillerRate - 2) * 10, 30);
        }

        // Penalize long pauses
        score -= Math.min(longPauseCount * 5, 20);

        score = Math.max(0, Math.min(100, score));

        // Generate insight
        let insight = '';
        if (avgTimeToFirstWord > 1.5) {
            insight = 'You hesitate before starting responses, suggesting mental translation before speaking.';
        } else if (struggleFillerRate > 4) {
            insight = 'High struggle filler rate indicates processing difficulties during speech.';
        } else if (score >= 80) {
            insight = 'Strong cognitive reflex. You process and respond quickly.';
        } else {
            insight = 'Moderate response speed. Practice reducing thinking pauses.';
        }

        return {
            score: Math.round(score),
            avgTimeToFirstWord: Math.round(avgTimeToFirstWord * 10) / 10,
            struggleFillerRate: Math.round(struggleFillerRate * 10) / 10,
            longPauseCount,
            insight
        };
    }

    // ========================================================================
    // SPEECH RHYTHM ANALYSIS
    // ========================================================================

    static analyzeSpeechRhythm(
        transcript: TranscriptSegment[],
        metrics: PerformanceMetrics,
        sessionDuration: number
    ): SpeechRhythmScore {
        // Calculate WPM variance by analyzing word density over time windows
        const windowSize = 10; // seconds
        const wpmSamples: number[] = [];
        const rhythmCurve: Array<{ time: number; wpm: number; label?: string }> = [];

        // Group transcript by time windows
        const chunks = this.chunkByTimeWindow(transcript, windowSize);

        chunks.forEach((chunk, index) => {
            const wordCount = chunk.reduce((sum, seg) => sum + seg.text.split(/\s+/).length, 0);
            const wpm = (wordCount / windowSize) * 60;
            wpmSamples.push(wpm);

            rhythmCurve.push({
                time: index * windowSize,
                wpm: Math.round(wpm)
            });
        });

        // Calculate variance
        const avgWpm = wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length;
        const variance = wpmSamples.reduce((sum, wpm) => sum + Math.pow(wpm - avgWpm, 2), 0) / wpmSamples.length;
        const wpmVariance = Math.sqrt(variance);

        // Stability index (lower variance = higher stability)
        const stabilityIndex = Math.max(0, 100 - wpmVariance);

        // Score calculation
        let score = stabilityIndex;

        // Penalize extreme fluctuations
        const maxFluctuation = Math.max(...wpmSamples) - Math.min(...wpmSamples);
        if (maxFluctuation > 80) {
            score -= 20;
        }

        score = Math.max(0, Math.min(100, score));

        // Generate insight
        let insight = '';
        if (wpmVariance > 40) {
            insight = 'Your speed drops when forming complex ideas, causing perceived uncertainty.';
        } else if (wpmVariance < 20) {
            insight = 'Excellent rhythm control. Your speech pace is consistent.';
        } else {
            insight = 'Moderate rhythm stability. Focus on maintaining steady pace.';
        }

        return {
            score: Math.round(score),
            wpmVariance: Math.round(wpmVariance),
            stabilityIndex: Math.round(stabilityIndex),
            rhythmCurve,
            insight
        };
    }

    // ========================================================================
    // LANGUAGE MATURITY ANALYSIS
    // ========================================================================

    static analyzeLanguageMaturity(
        transcript: TranscriptSegment[],
        metrics: PerformanceMetrics
    ): LanguageMaturityScore {
        const allText = transcript.map(t => t.text).join(' ').toLowerCase();
        const words = allText.split(/\s+/).filter(w => w.length > 0);

        // CEFR Level Analysis
        const cefrScores = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };

        words.forEach(word => {
            const cleanWord = word.replace(/[^a-z]/g, '');
            for (const [level, wordList] of Object.entries(CEFR_WORDLISTS)) {
                if ((wordList as string[]).includes(cleanWord)) {
                    cefrScores[level as keyof typeof cefrScores]++;
                    break;
                }
            }
        });

        // Calculate weighted CEFR level
        const weights = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
        const totalWeighted = Object.entries(cefrScores).reduce(
            (sum, [level, count]) => sum + count * weights[level as keyof typeof weights],
            0
        );
        const totalWords = Object.values(cefrScores).reduce((a, b) => a + b, 0);
        const avgLevel = totalWords > 0 ? totalWeighted / totalWords : 1;

        // Determine CEFR level
        let cefrLevel = 'A1';
        if (avgLevel >= 5.5) cefrLevel = 'C2';
        else if (avgLevel >= 4.5) cefrLevel = 'C1';
        else if (avgLevel >= 3.5) cefrLevel = 'B2';
        else if (avgLevel >= 2.5) cefrLevel = 'B1';
        else if (avgLevel >= 1.5) cefrLevel = 'A2';

        const lexicalMaturityIndex = Math.min(100, (avgLevel / 6) * 100);

        // Verb Sophistication
        let verbScore = 0;
        let verbCount = 0;
        words.forEach(word => {
            const cleanWord = word.replace(/[^a-z]/g, '');
            if (VERB_SOPHISTICATION[cleanWord]) {
                verbScore += VERB_SOPHISTICATION[cleanWord];
                verbCount++;
            }
        });
        const verbSophistication = verbCount > 0 ? (verbScore / verbCount) * 20 : 50;

        // Connector Complexity
        let connectorScore = 0;
        CONNECTORS.forEach((connector: { phrase: string; level: number }) => {
            if (allText.includes(connector.phrase)) {
                connectorScore += connector.level;
            }
        });
        const connectorComplexity = Math.min(100, connectorScore * 10);

        // Overall score
        const score = (lexicalMaturityIndex * 0.5 + verbSophistication * 0.3 + connectorComplexity * 0.2);

        // Generate insight
        let insight = '';
        if (cefrLevel === 'A1' || cefrLevel === 'A2') {
            insight = 'You rely on basic verbs. Upgrading "get" to "acquire" increases executive tone.';
        } else if (cefrLevel === 'B1' || cefrLevel === 'B2') {
            insight = `Lexical level: ${cefrLevel}. Integrate more advanced connectors like "consequently".`;
        } else {
            insight = `Strong vocabulary at ${cefrLevel} level. Continue expanding domain-specific terms.`;
        }

        return {
            score: Math.round(score),
            cefrLevel,
            lexicalMaturityIndex: Math.round(lexicalMaturityIndex),
            verbSophistication: Math.round(verbSophistication),
            connectorComplexity: Math.round(connectorComplexity),
            insight
        };
    }

    // ========================================================================
    // SOCIAL PRESENCE ANALYSIS
    // ========================================================================

    static analyzeSocialPresence(
        transcript: TranscriptSegment[],
        sessionDuration: number
    ): SocialPresenceScore {
        if (transcript.length === 0) {
            return {
                score: 0,
                talkTimeRatio: 0,
                silenceSurrenderCount: 0,
                interruptionRecoveryRate: 0,
                insight: 'Insufficient data for social presence analysis.'
            };
        }

        // Calculate talk-time ratio (assumes 2-person conversation)
        const userIds = [...new Set(transcript.map(t => t.userId))];
        const userId = userIds[0]; // Primary user

        const userSegments = transcript.filter(t => t.userId === userId);
        const userWordCount = userSegments.reduce((sum, s) => sum + s.text.split(/\s+/).length, 0);
        const totalWordCount = transcript.reduce((sum, s) => sum + s.text.split(/\s+/).length, 0);

        const talkTimeRatio = totalWordCount > 0 ? userWordCount / totalWordCount : 0;

        // Detect silence surrenders (user stays quiet >3s after partner finishes)
        let silenceSurrenderCount = 0;
        for (let i = 1; i < transcript.length; i++) {
            const prev = transcript[i - 1];
            const curr = transcript[i];

            if (prev.userId !== userId && curr.userId !== userId) {
                const gap = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000;
                if (gap > 3) {
                    silenceSurrenderCount++;
                }
            }
        }

        // Interruption recovery (simplified: did user speak after being cut off?)
        // This would require more sophisticated turn-taking analysis
        const interruptionRecoveryRate = 0.7; // Placeholder

        // Score calculation
        let score = 100;

        // Ideal talk ratio is 40-60%
        if (talkTimeRatio < 0.3) {
            score -= 40;
        } else if (talkTimeRatio < 0.4) {
            score -= 20;
        } else if (talkTimeRatio > 0.7) {
            score -= 15; // Dominating conversation
        }

        score -= Math.min(silenceSurrenderCount * 10, 30);

        score = Math.max(0, Math.min(100, score));

        // Generate insight
        let insight = '';
        if (talkTimeRatio < 0.35) {
            insight = 'You stay silent after interruptions, reducing perceived authority.';
        } else if (talkTimeRatio > 0.65) {
            insight = 'You dominate the conversation. Allow more space for dialogue.';
        } else if (silenceSurrenderCount > 3) {
            insight = 'You give up the floor too easily during pauses.';
        } else {
            insight = 'Good conversational balance and presence.';
        }

        return {
            score: Math.round(score),
            talkTimeRatio: Math.round(talkTimeRatio * 100) / 100,
            silenceSurrenderCount,
            interruptionRecoveryRate: Math.round(interruptionRecoveryRate * 100) / 100,
            insight
        };
    }

    // ========================================================================
    // PRESSURE STABILITY ANALYSIS
    // ========================================================================

    static analyzePressureStability(
        cognitiveReflex: CognitiveReflexScore,
        speechRhythm: SpeechRhythmScore,
        languageMaturity: LanguageMaturityScore
    ): PressureStabilityScore {
        // Simplified: assumes first half = baseline, second half = high load
        // In production, would detect complexity spikes via topic modeling

        const baselineScore = 75; // Placeholder
        const highLoadScore = 60; // Placeholder

        const degradationBySkill = {
            reflex: cognitiveReflex.score < 70 ? 23 : 10,
            grammar: languageMaturity.score < 70 ? 15 : 4,
            rhythm: speechRhythm.score < 70 ? 17 : 8
        };

        const score = Math.round((baselineScore + highLoadScore) / 2);

        let insight = '';
        if (degradationBySkill.reflex > 20) {
            insight = 'Reflex speed drops significantly under cognitive load.';
        } else if (degradationBySkill.rhythm > 15) {
            insight = 'Speech stability decreases when complexity increases.';
        } else {
            insight = 'Grammar remains strong under pressure.';
        }

        return {
            score,
            baselineScore,
            highLoadScore,
            degradationBySkill,
            insight
        };
    }

    // ========================================================================
    // FILLER INTELLIGENCE
    // ========================================================================

    static analyzeFillerIntelligence(
        transcript: TranscriptSegment[],
        sessionDuration: number
    ): FillerIntelligenceData {
        const allText = transcript.map(t => t.text).join(' ').toLowerCase();

        const struggleSignals: { word: string; count: number }[] = [];
        const discourseMarkers: { word: string; count: number }[] = [];

        STRUGGLE_SIGNALS.forEach(filler => {
            const regex = new RegExp(`\\b${filler}\\b`, 'g');
            const matches = allText.match(regex);
            if (matches) {
                struggleSignals.push({ word: filler, count: matches.length });
            }
        });

        DISCOURSE_MARKERS.forEach(marker => {
            const count = (allText.match(new RegExp(marker, 'g')) || []).length;
            if (count > 0) {
                discourseMarkers.push({ word: marker, count });
            }
        });

        const totalStruggle = struggleSignals.reduce((sum, s) => sum + s.count, 0);
        const totalDiscourse = discourseMarkers.reduce((sum, d) => sum + d.count, 0);

        let insight = '';
        if (totalStruggle > totalDiscourse * 2) {
            insight = 'Your hesitation fillers are high; natural discourse markers are low.';
        } else if (totalStruggle < 3) {
            insight = 'Minimal struggle signals detected. Speech flows naturally.';
        } else {
            insight = 'Balanced use of fillers and discourse markers.';
        }

        return {
            struggleSignals: struggleSignals.sort((a, b) => b.count - a.count),
            discourseMarkers: discourseMarkers.sort((a, b) => b.count - a.count),
            totalStruggle,
            totalDiscourse,
            insight
        };
    }

    // ========================================================================
    // DIAGNOSIS GENERATION
    // ========================================================================

    static generateDiagnosis(scores: {
        cognitiveReflex: CognitiveReflexScore;
        speechRhythm: SpeechRhythmScore;
        languageMaturity: LanguageMaturityScore;
        socialPresence: SocialPresenceScore;
        pressureStability: PressureStabilityScore;
    }): string {
        const { cognitiveReflex, speechRhythm, languageMaturity, socialPresence, pressureStability } = scores;

        // Identify strengths and weaknesses
        const strength = languageMaturity.score >= 70 ? 'vocabulary' :
            socialPresence.score >= 70 ? 'conversational presence' :
                speechRhythm.score >= 70 ? 'rhythm control' : 'speaking confidence';

        const weakness = cognitiveReflex.score < 60 ? 'hesitation' :
            speechRhythm.score < 60 ? 'rhythm stability' :
                socialPresence.score < 60 ? 'social presence' : 'minor processing delays';

        return `You have the ${strength} of a ${languageMaturity.cefrLevel} speaker, but ${weakness} ${pressureStability.score < 65 ? 'under pressure ' : ''}is reducing your perceived confidence.`;
    }

    static generateCoachInsights(data: {
        cognitiveReflex: CognitiveReflexScore;
        speechRhythm: SpeechRhythmScore;
        languageMaturity: LanguageMaturityScore;
        socialPresence: SocialPresenceScore;
        fillerIntelligence: FillerIntelligenceData;
    }): string[] {
        const insights: string[] = [];

        if (data.cognitiveReflex.avgTimeToFirstWord > 1.2) {
            insights.push('Practice answering within 1 second to improve reflex speed.');
        }

        if (data.languageMaturity.verbSophistication < 60) {
            insights.push('Replace "get" with "obtain" or "acquire" in formal contexts.');
        }

        if (data.socialPresence.talkTimeRatio < 0.35) {
            insights.push('Maintain speaking during interruptions to assert presence.');
        }

        if (data.speechRhythm.wpmVariance > 40) {
            insights.push('Focus on maintaining steady pace, even during complex ideas.');
        }

        if (data.fillerIntelligence.totalStruggle > 10) {
            insights.push('Reduce "um/uh" by practicing pausing silently instead.');
        }

        if (insights.length === 0) {
            insights.push('Maintain your current performance level through regular practice.');
        }

        return insights.slice(0, 4); // Max 4 insights
    }

    // ========================================================================
    // PHASE 2: COACHING INTELLIGENCE - PRIMARY LIMITER
    // ========================================================================

    static determinePrimaryLimiter(scores: {
        cognitiveReflex: CognitiveReflexScore;
        speechRhythm: SpeechRhythmScore;
        languageMaturity: LanguageMaturityScore;
        socialPresence: SocialPresenceScore;
        pressureStability: PressureStabilityScore;
    }): PrimaryLimiter {
        // Weighted impact on perceived confidence
        const weights = {
            cognitiveReflex: 1.2,   // Hesitation heavily affects confidence
            speechRhythm: 1.1,
            socialPresence: 1.15,
            languageMaturity: 0.9,
            pressureStability: 1.0
        };

        const systemLabels = {
            cognitiveReflex: 'Cognitive Reflex',
            speechRhythm: 'Speech Rhythm Control',
            languageMaturity: 'Language Maturity',
            socialPresence: 'Social Presence',
            pressureStability: 'Pressure Stability'
        };

        const insights = {
            cognitiveReflex: 'Delay before speaking reduces perceived confidence.',
            speechRhythm: 'Inconsistent pace creates uncertainty in listeners.',
            socialPresence: 'Low speaking share diminishes authority.',
            languageMaturity: 'Basic vocabulary limits executive tone.',
            pressureStability: 'Performance degrades under cognitive load.'
        };

        type SystemKey = keyof typeof weights;
        let lowest: SystemKey = 'cognitiveReflex';
        let lowestImpact = Infinity;

        (Object.keys(weights) as SystemKey[]).forEach(key => {
            const impactScore = scores[key].score * weights[key];
            if (impactScore < lowestImpact) {
                lowestImpact = impactScore;
                lowest = key;
            }
        });

        return {
            system: lowest,
            label: systemLabels[lowest],
            score: scores[lowest].score,
            insight: insights[lowest]
        };
    }

    // ========================================================================
    // PHASE 2: COACHING INTELLIGENCE - NEXT FOCUS
    // ========================================================================

    static determineNextFocus(limiterSystem: string): NextFocus {
        const focusMap: Record<string, { target: string; action: string }> = {
            cognitiveReflex: {
                target: 'Reduce response delay below 1.2 seconds',
                action: 'Practice answering within one second without translating mentally.'
            },
            speechRhythm: {
                target: 'Maintain steady pace during complex ideas',
                action: 'Avoid slowing down when forming longer sentences.'
            },
            socialPresence: {
                target: 'Increase speaking share to 45–55%',
                action: 'Continue speaking after interruptions.'
            },
            languageMaturity: {
                target: 'Elevate verb sophistication to B2+ level',
                action: 'Replace "get/have/make" with "obtain/possess/create".'
            },
            pressureStability: {
                target: 'Maintain baseline performance under complexity',
                action: 'Practice speaking on challenging topics to build resilience.'
            }
        };

        const focus = focusMap[limiterSystem] || focusMap.cognitiveReflex;

        return {
            system: limiterSystem,
            target: focus.target,
            action: focus.action
        };
    }

    // ========================================================================
    // PHASE 2: COACHING INTELLIGENCE - PERFORMANCE MOMENTS
    // ========================================================================

    static detectPerformanceMoments(
        transcript: TranscriptSegment[],
        cognitiveReflex: CognitiveReflexScore,
        speechRhythm: SpeechRhythmScore
    ): PerformanceMoments {
        if (transcript.length === 0) {
            return {
                bestMoment: null,
                confidenceDrop: null
            };
        }

        let bestMoment: { timestamp: Date; context: string } | null = null;
        let dropMoment: { timestamp: Date; context: string } | null = null;

        const chunks = this.chunkByTimeWindow(transcript, 15); // 15-second windows

        chunks.forEach((chunk, idx) => {
            const wordCount = chunk.reduce((sum, seg) => sum + seg.text.split(/\s+/).length, 0);
            const wpm = (wordCount / 15) * 60;
            const fillerCount = this.countStruggleFillers(chunk);

            // Best moment: high WPM, no fillers, stable
            const isStable = Math.abs(wpm - 130) < 20; // Near target WPM
            if (isStable && fillerCount === 0 && wordCount > 10) {
                if (!bestMoment) {
                    bestMoment = {
                        timestamp: chunk[0].timestamp,
                        context: chunk[0].text.substring(0, 50) + '...'
                    };
                }
            }

            // Check for long pauses within this chunk
            for (let i = 1; i < chunk.length; i++) {
                const delay = (chunk[i].timestamp.getTime() - chunk[i - 1].timestamp.getTime()) / 1000;
                if (delay > 2.5 && !dropMoment) {
                    dropMoment = {
                        timestamp: chunk[i].timestamp,
                        context: chunk[i].text.substring(0, 50) + '...'
                    };
                }
            }
        });

        const formatTime = (date: Date, startTime: Date) => {
            const seconds = Math.floor((date.getTime() - startTime.getTime()) / 1000);
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        const startTime = transcript[0].timestamp;

        return {
            bestMoment: bestMoment ? formatTime(bestMoment.timestamp, startTime) : null,
            confidenceDrop: dropMoment ? formatTime(dropMoment.timestamp, startTime) : null,
            bestMomentContext: bestMoment?.context,
            dropContext: dropMoment?.context
        };
    }

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    private static countStruggleFillers(transcript: TranscriptSegment[]): number {
        const allText = transcript.map(t => t.text).join(' ').toLowerCase();
        let count = 0;
        STRUGGLE_SIGNALS.forEach(filler => {
            const regex = new RegExp(`\\b${filler}\\b`, 'g');
            const matches = allText.match(regex);
            if (matches) count += matches.length;
        });
        return count;
    }

    private static chunkByTimeWindow(
        transcript: TranscriptSegment[],
        windowSeconds: number
    ): TranscriptSegment[][] {
        if (transcript.length === 0) return [];

        const chunks: TranscriptSegment[][] = [];
        let currentChunk: TranscriptSegment[] = [transcript[0]];
        const startTime = transcript[0].timestamp;

        for (let i = 1; i < transcript.length; i++) {
            const elapsed = (transcript[i].timestamp.getTime() - startTime.getTime()) / 1000;
            const chunkStart = (currentChunk[0].timestamp.getTime() - startTime.getTime()) / 1000;

            if (elapsed - chunkStart < windowSeconds) {
                currentChunk.push(transcript[i]);
            } else {
                chunks.push(currentChunk);
                currentChunk = [transcript[i]];
            }
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }

        return chunks;
    }

    // ========================================================================
    // P2P COACHING FEEDBACK GENERATION
    // ========================================================================

    /**
     * Generate coaching feedback for P2P Live Practice sessions
     * Transforms performance analytics into coaching language
     */
    static generateCoachingFeedback(
        analytics: PerformanceAnalytics,
        corrections: any[],
        transcript: TranscriptSegment[]
    ): CoachingFeedback {
        // 1. Performance Summary: Combine primary limiter + overall tone
        const summary = this.generatePerformanceSummary(analytics);

        // 2. Performance Impact: Map patterns to impact table
        const impact = this.generatePerformanceImpact(analytics, corrections);

        // 3. Pattern Insight: Detect recurring correction patterns
        const pattern = this.detectRepeatingPattern(corrections);

        // 4. Hesitation Signals: Extract from analytics
        const signals = {
            longPauses: analytics.cognitiveReflex.longPauseCount,
            restarts: Math.round(analytics.speechRhythm.wpmVariance / 10), // Approximation
            fillers: Math.round(analytics.cognitiveReflex.struggleFillerRate)
        };

        // 5. Next Breakthrough: Use Next Focus from analytics
        const breakthrough = {
            target: analytics.nextFocus.target,
            action: analytics.nextFocus.action
        };

        // 6. Performance Moments: Format timestamps
        const moments = {
            strongest: analytics.performanceMoments.bestMoment,
            drop: analytics.performanceMoments.confidenceDrop
        };

        return {
            performanceSummary: summary,
            performanceImpact: impact,
            patternInsight: pattern,
            hesitationSignals: signals,
            nextBreakthrough: breakthrough,
            performanceMoments: moments
        };
    }

    private static generatePerformanceSummary(analytics: PerformanceAnalytics): string {
        const limiter = analytics.primaryLimiter;
        const overallTone = analytics.languageMaturity.score > 70 ? 'clear' : 'developing';

        const summaries: Record<string, string> = {
            cognitiveReflex: `Your ideas were ${overallTone}, but hesitation reduced perceived confidence.`,
            speechRhythm: `Your content was ${overallTone}, but uneven pace created uncertainty.`,
            socialPresence: `You shared valuable insights, but low speaking share diminished authority.`,
            languageMaturity: `You communicated clearly, but vocabulary limited executive tone.`,
            pressureStability: `You started strong, but performance declined under cognitive load.`
        };

        return summaries[limiter.system] || `Your speaking showed ${overallTone} ideas with room for refinement.`;
    }

    private static generatePerformanceImpact(
        analytics: PerformanceAnalytics,
        corrections: any[]
    ): ImpactArea[] {
        const impact: ImpactArea[] = [];

        // Fluency impact
        if (analytics.cognitiveReflex.score < 70) {
            impact.push({
                area: 'Fluency',
                whatHappened: `${analytics.cognitiveReflex.longPauseCount} long pauses (>${analytics.cognitiveReflex.avgTimeToFirstWord.toFixed(1)}s)`,
                effect: 'Sounds unsure or unprepared'
            });
        }

        // Grammar impact
        const grammarErrors = corrections.filter(c => c.type === 'grammar').length;
        if (grammarErrors > 0) {
            impact.push({
                area: 'Grammar',
                whatHappened: `${grammarErrors} tense/structure slips`,
                effect: 'Reduces professional trust'
            });
        }

        // Vocabulary impact
        if (analytics.languageMaturity.score < 70) {
            impact.push({
                area: 'Vocabulary',
                whatHappened: `B1-level phrasing (${analytics.languageMaturity.cefrLevel})`,
                effect: 'Limits executive presence'
            });
        }

        // Rhythm impact
        if (analytics.speechRhythm.score < 70) {
            impact.push({
                area: 'Rhythm',
                whatHappened: `WPM varied by ${Math.round(analytics.speechRhythm.wpmVariance)}`,
                effect: 'Creates listener uncertainty'
            });
        }

        return impact;
    }

    private static detectRepeatingPattern(corrections: any[]): string | null {
        if (corrections.length < 2) return null;

        // Analyze correction types
        const types = corrections.map(c => c.type || 'grammar');
        const typeCounts = types.reduce((acc: any, type: string) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        // Find most common issue
        const mostCommon = Object.entries(typeCounts)
            .sort((a: any, b: any) => b[1] - a[1])[0];

        if (!mostCommon || mostCommon[1] < 2) return null;

        const patterns: Record<string, string> = {
            grammar: 'You often begin sentences before forming the full structure.',
            vocabulary: 'You rely on basic verbs (get, have, make) instead of precise alternatives.',
            fluency: 'You restart sentences mid-thought when searching for words.',
            pronunciation: 'You hesitate before unfamiliar technical terms.'
        };

        return patterns[mostCommon[0] as string] || 'You show a recurring pattern in your speaking.';
    }
}
