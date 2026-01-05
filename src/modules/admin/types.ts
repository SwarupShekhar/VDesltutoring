export interface AdminSettings {
    fluency: {
        strictness: number // 0.0 - 2.0 multiplier
        pauseTolerance: number // 0.0 - 1.0 ratio
        fillerTolerance: number // 0.0 - 1.0 ratio
    }
    cefr: {
        a1_cutoff: number
        a2_cutoff: number
        b1_cutoff: number
        b2_cutoff: number
        c1_cutoff: number
        c2_cutoff: number
    }
    coaching: {
        drillDifficultyOffset: number // -1 (easier) to 1 (harder)
        enableMicroLessons: boolean
    }
}
