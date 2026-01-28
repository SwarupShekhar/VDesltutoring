import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { geminiService } from '@/lib/gemini-service';

/**
 * POST /api/drills/generate
 * 
 * Generates custom practice drills based on user's primary limiter
 */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { limiterSystem, limiterScore } = body;

        if (!limiterSystem) {
            return NextResponse.json(
                { error: 'Missing limiterSystem parameter' },
                { status: 400 }
            );
        }

        // Get drill template based on limiter system
        const drillTemplate = getDrillTemplate(limiterSystem, limiterScore);

        // Use Gemini to generate personalized exercises
        const prompt = `You are an expert English speaking coach. Generate 5 specific practice exercises for improving ${drillTemplate.skillName}.

Context: The user scored ${limiterScore}/100 in ${drillTemplate.skillName}.
Goal: ${drillTemplate.goal}

Generate 5 concrete practice exercises. Each should be:
- Actionable (clear instructions)
- Specific (not generic advice)
- Progressive (builds the targeted skill)

Format as JSON array of strings. Example:
["Exercise 1 description...", "Exercise 2 description...", ...]`;

        const response = await geminiService.generateRawText(prompt);

        let exercises: string[];
        try {
            // Try to parse as JSON array
            exercises = JSON.parse(response);
        } catch {
            // Fallback: split by newlines and filter
            exercises = response
                .split('\n')
                .filter((line: string) => line.trim().length > 10)
                .slice(0, 5);
        }

        const drill = {
            title: drillTemplate.title,
            description: drillTemplate.description,
            exercises: exercises.length > 0 ? exercises : drillTemplate.fallbackExercises
        };

        return NextResponse.json({ drill });

    } catch (error) {
        console.error('[Drill Generator API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate drills' },
            { status: 500 }
        );
    }
}

/**
 * Drill templates for each performance system
 */
function getDrillTemplate(system: string, score: number) {
    const templates: Record<string, any> = {
        cognitiveReflex: {
            skillName: 'Cognitive Reflex',
            title: 'Instant Response Training',
            description: 'Practice answering within 1 second without mental translation',
            goal: 'Reduce response delay below 1.2 seconds',
            fallbackExercises: [
                'Set a 1-second timer. Answer "What\'s your professional background?" before the beep.',
                'Practice saying your opinion on a random topic within 1 second of seeing it.',
                'Record yourself answering common questions. Measure delay between question and first word.',
                'Use the "no-pause" rule: Start speaking immediately, even if incomplete. Refine mid-sentence.',
                'Practice with a partner who interrupts you. Respond instantly without visible hesitation.'
            ]
        },
        speechRhythm: {
            skillName: 'Speech Rhythm Control',
            title: 'Pace Consistency Training',
            description: 'Maintain steady speaking speed during complex ideas',
            goal: 'Keep WPM variance below 30',
            fallbackExercises: [
                'Read a complex paragraph at 130 WPM using a metronome. Don\'t slow down.',
                'Explain a technical concept while maintaining the same pace as casual conversation.',
                'Record yourself speaking for 2 minutes. Count WPM in 15-second chunks. Aim for ±10 variance.',
                'Practice transitioning between simple and complex sentences without rhythm change.',
                'Use a pacing app to get real-time feedback on your speaking speed stability.'
            ]
        },
        socialPresence: {
            skillName: 'Social Presence',
            title: 'Conversational Authority Training',
            description: 'Increase speaking share and hold the floor',
            goal: 'Achieve 45-55% talk-time ratio',
            fallbackExercises: [
                'Practice continuing your point after someone interjects. Don\'t surrender the floor.',
                'In conversations, track your speaking time. Aim for 50% in balanced discussions.',
                'When interrupted, use bridge phrases: "Let me finish this thought..." then continue.',
                'Practice speaking in longer bursts (30+ seconds) without checking for approval.',
                'Record a mock negotiation. Count who spoke more. Adjust to reach 50-50 balance.'
            ]
        },
        languageMaturity: {
            skillName: 'Language Maturity',
            title: 'Lexical Upgrade Training',
            description: 'Replace basic verbs with sophisticated alternatives',
            goal: 'Elevate vocabulary to B2+ level',
            fallbackExercises: [
                'Replace every instance of "get" in your next conversation with: obtain, acquire, receive, secure.',
                'Upgrade "make" to: create, construct, generate, produce, develop.',
                'Use advanced connectors: "consequently", "nevertheless", "furthermore" instead of "so", "but", "and".',
                'Rewrite casual emails in formal tone. Compare verb sophistication before/after.',
                'Keep a "word upgrade journal". Track every basic verb you replace with an advanced one.'
            ]
        },
        pressureStability: {
            skillName: 'Pressure Stability',
            title: 'Stress Resilience Training',
            description: 'Maintain performance under cognitive load',
            goal: 'Keep skill degradation below 10%',
            fallbackExercises: [
                'Practice speaking on unfamiliar topics with 0 preparation time. Maintain baseline fluency.',
                'Set a timer for 30 seconds. Explain a complex concept clearly before time runs out.',
                'Simulate high-pressure scenarios: job interviews, presentations, debates. Record and compare.',
                'Use the "escalating complexity" method: Start with easy topics, gradually increase difficulty.',
                'Practice multitasking while speaking: solve a puzzle while explaining your day.'
            ]
        }
    };

    return templates[system] || templates.cognitiveReflex;
}
