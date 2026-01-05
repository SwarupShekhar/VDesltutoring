export type MicroLessonType =
    | "START_FASTER"
    | "KILL_FILLERS"
    | "STOP_RESTARTING"
    | "SPEAK_LONGER"
    | "SPEAK_CLEARER"

export interface MicroLesson {
    id: string
    type: MicroLessonType
    path: string       // NEW: The skill path this lesson belongs to
    title: string
    description: string
    example: string
    drill: string
}

export const MICRO_LESSONS: MicroLesson[] = [
    {
        id: "start-faster",
        type: "START_FASTER",
        path: "Speaking Flow",
        title: "Start Speaking Faster",
        description: "Your brain pauses before words. We want to speak before thinking.",
        example: "Instead of waiting → just say: 'Well, I think…'",
        drill: "Answer the next question immediately without stopping."
    },
    {
        id: "kill-fillers",
        type: "KILL_FILLERS",
        path: "Clear Speech",
        title: "Remove 'Um' and 'Like'",
        description: "Fillers make you sound unsure. Silence sounds confident.",
        example: "Say nothing instead of 'um'.",
        drill: "Speak for 10 seconds without using any filler."
    },
    {
        id: "stop-restarting",
        type: "STOP_RESTARTING",
        path: "Speaking Flow",
        title: "Trust Your First Thought",
        description: "Restarting sentences breaks flow.",
        example: "Don’t restart — continue.",
        drill: "Finish every sentence even if it’s imperfect."
    },
    {
        id: "speak-longer",
        type: "SPEAK_LONGER",
        path: "Speaking Flow",
        title: "Extend Your Thoughts",
        description: "Short answers block fluency growth.",
        example: "Add 'because…' or 'so…'",
        drill: "Speak for 20 seconds."
    }
]
