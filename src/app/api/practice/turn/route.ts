import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { PracticeTurn } from "@/lib/practice"

const PRACTICE_LIBRARY: PracticeTurn[] = [
    {
        id: "travel-1",
        type: "LISTEN_REACT",
        situation: "Travel",
        difficulty: 1,
        prompt: "You are at an airport. Someone asks: 'Where are you flying today?' Answer naturally.",
    },
    {
        id: "work-1",
        type: "FINISH_THOUGHT",
        situation: "Work",
        difficulty: 1,
        prompt: "Finish this sentence: 'I think this project is important because…'",
    },
    {
        id: "social-1",
        type: "PICK_SPEAK",
        situation: "Daily Life",
        difficulty: 1,
        prompt: "Choose one and speak for 10 seconds: coffee, weekend, your city",
        choices: ["coffee", "weekend", "your city"],
    },
    {
        id: "interview-1",
        type: "ROLEPLAY",
        situation: "Interviews",
        difficulty: 2,
        prompt: "You are in a job interview. Answer: 'Tell me about yourself.'",
    },
]

export async function GET() {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For now: simple random
    const turn = PRACTICE_LIBRARY[Math.floor(Math.random() * PRACTICE_LIBRARY.length)]

    return NextResponse.json(turn)
}
