/**
 * Fluency Skill Progress Tracker
 * 
 * Tracks level progression for major fluency paths (e.g. Speaking Flow, Clear Speech).
 * Levels increase based on completed micro-lesson drills.
 */

export interface SkillProgress {
    currentLevel: number
    drillsCompleted: number
}

// Map skill path name -> progress
type SkillMap = Record<string, SkillProgress>

const STORAGE_KEY = 'fluency_skill_progress'

/**
 * Get current level and progress for a skill path.
 */
export function getSkillProgress(pathName: string): SkillProgress {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const map: SkillMap = stored ? JSON.parse(stored) : {}

        return map[pathName] || { currentLevel: 1, drillsCompleted: 0 }
    } catch (e) {
        return { currentLevel: 1, drillsCompleted: 0 }
    }
}

/**
 * Increment progress for a skill path.
 * Returns true if user leveled up.
 */
export function incrementSkillProgress(pathName: string): boolean {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const map: SkillMap = stored ? JSON.parse(stored) : {}

        const current = map[pathName] || { currentLevel: 1, drillsCompleted: 0 }

        current.drillsCompleted += 1

        // Simple leveling logic: Every 3 drills = +1 Level
        const newLevel = Math.floor(current.drillsCompleted / 3) + 1
        const leveledUp = newLevel > current.currentLevel

        current.currentLevel = newLevel

        map[pathName] = current
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map))

        return leveledUp
    } catch (e) {
        return false
    }
}
