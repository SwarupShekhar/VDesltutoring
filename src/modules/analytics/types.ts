export interface AnalyticsSummary {
    avgPauseReduction: number // Percentage reduction
    cefrProgression: {
        a1_to_a2: number // count
        a2_to_b1: number
        b1_to_b2: number
        b2_to_c1: number
        timeToLevelUpAvg: number // days
    }
    drillEffectiveness: {
        drillType: string
        improvementRate: number // score delta after drill
    }[]
    conversionVsFluency: {
        fluencyBin: string // "0-20", "20-40" etc
        conversionRate: number
    }[]
}
