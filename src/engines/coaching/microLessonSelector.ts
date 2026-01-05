import { MICRO_LESSONS, MicroLessonType } from "./microLessons"

export function pickMicroLesson(metrics: {
    pauseRatio: number
    fillerRate: number
    restartRate: number
    wordCount: number
}): MicroLessonType | null {
    if (metrics.pauseRatio > 0.15) return "START_FASTER"
    if (metrics.fillerRate > 0.08) return "KILL_FILLERS"
    if (metrics.restartRate > 0.1) return "STOP_RESTARTING"
    if (metrics.wordCount < 30) return "SPEAK_LONGER"
    return null
}

export function getMicroLesson(type: MicroLessonType | null) {
    if (!type) return null
    return MICRO_LESSONS.find(l => l.type === type) || null
}
