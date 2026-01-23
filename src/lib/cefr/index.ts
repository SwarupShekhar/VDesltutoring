/**
 * CEFR Module - Public API
 * 
 * This module is the single source of truth for CEFR logic.
 * Import from this file, not from individual files.
 */

// Configuration
export {
    type CEFRLevel,
    type ConfidenceBand,
    type CEFRPromotionGate,
    CEFR_PROMOTION_GATES,
    CEFR_LEVEL_LABELS,
    GATE_FAILURE_EXPLANATIONS,
    AI_LEVEL_BEHAVIOR,
    getNextCEFRLevel,
    getPreviousCEFRLevel
} from "./cefrPromotionConfig";

// Metrics Aggregation
export {
    type AggregatedMetrics,
    type PracticeType,
    aggregateUserSpeechMetrics,
    cacheAggregatedMetrics
} from "./aggregateUserSpeechMetrics";

// Promotion Engine
export {
    type GateFailure,
    type PromotionResult,
    evaluateCEFRPromotion,
    evaluateCEFRDemotion,
    getPromotionRequirements
} from "./evaluateCEFRPromotion";
