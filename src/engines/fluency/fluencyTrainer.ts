export type FluencyPattern =
    | "HESITATION"
    | "FILLER_OVERUSE"
    | "TRANSLATION_THINKING"
    | "PRONUNCIATION"
    | "GRAMMAR_SCAFFOLD"

export function inferPattern(text: string): FluencyPattern | null {
    const t = text.toLowerCase()

    if (t.includes("pause") || t.includes("hesitate")) return "HESITATION"
    if (t.includes("filler") || t.includes("uh") || t.includes("um")) return "FILLER_OVERUSE"
    if (t.includes("translate") || t.includes("native language")) return "TRANSLATION_THINKING"
    if (t.includes("sound") || t.includes("pronunciation")) return "PRONUNCIATION"
    if (t.includes("grammar") || t.includes("structure")) return "GRAMMAR_SCAFFOLD"

    return null
}

export function generateDrills(patterns: string[]) {
    const detected = patterns
        .map(inferPattern)
        .filter(Boolean) as FluencyPattern[]

    const unique = [...new Set(detected)]

    return unique.map(pattern => {
        switch (pattern) {
            case "HESITATION":
                return {
                    pattern,
                    title: "Instant Response Drill",
                    instruction: "Answer immediately using: 'Well, I think…'",
                    goal: "Train you to start speaking before perfect wording appears."
                }

            case "FILLER_OVERUSE":
                return {
                    pattern,
                    title: "Silent Buffer Drill",
                    instruction: "Pause silently for 1 second instead of saying 'um' or 'uh'.",
                    goal: "Replace fillers with calm pauses."
                }

            case "TRANSLATION_THINKING":
                return {
                    pattern,
                    title: "React First Drill",
                    instruction: "Respond with feeling before details. Example: 'That sounds exciting…'",
                    goal: "Move from translating to reacting."
                }

            case "PRONUNCIATION":
                return {
                    pattern,
                    title: "Sound Clarity Drill",
                    instruction: "Repeat difficult words slowly, then in full sentence.",
                    goal: "Build confident sound patterns."
                }

            case "GRAMMAR_SCAFFOLD":
                return {
                    pattern,
                    title: "Structure Starter Drill",
                    instruction: "Begin with: 'I think that…' to anchor your sentence.",
                    goal: "Create a stable sentence frame."
                }
        }
    })
}
