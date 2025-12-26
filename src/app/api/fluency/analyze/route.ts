import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const FILLER_WORDS = ["um", "uh", "likes", "you know", "sort of", "kind of", "actually", "basically"];
const MAX_WPM_THRESHOLD = 150;
const MIN_WPM_THRESHOLD = 100;

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        // Optional: strict auth check (omitted for speed/robustness during rapid dev, but recommended)

        const body = await req.json();
        const { transcript, duration = 1 } = body; // duration in seconds (defaults to 1 chunk)

        if (!transcript || typeof transcript !== 'string') {
            return NextResponse.json({ error: "Invalid transcript" }, { status: 400 });
        }

        const text = transcript.toLowerCase();

        // 1. Detect Fillers
        const foundFillers = FILLER_WORDS.filter(word => text.includes(word));
        const fillerCount = foundFillers.length;

        // 2. Calculate WPM (Estimation based on chunk)
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
        const wpm = Math.round((wordCount / duration) * 60);

        // 3. Generate Coaching Cue
        let suggestion = null;
        let type: 'pacing' | 'filler' | 'grammar' | 'neutral' = 'neutral';

        if (fillerCount > 0) {
            suggestion = `Detected fillers: "${foundFillers.join(', ')}". Pause instead.`;
            type = 'filler';
        } else if (wpm > MAX_WPM_THRESHOLD) {
            suggestion = "Slow down slightly for clarity.";
            type = 'pacing';
        } else if (wpm < MIN_WPM_THRESHOLD && wordCount > 3) {
            suggestion = "Pick up the pace slightly.";
            type = 'pacing';
        }

        // 4. Return Data
        return NextResponse.json({
            success: true,
            analysis: {
                wpm,
                filler_count: fillerCount,
                fillers: foundFillers,
                suggestion,
                type
            }
        });

    } catch (err) {
        console.error("Fluency analyze failed", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
