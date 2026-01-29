
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching last 5 live_sessions...");
    const sessions = await prisma.live_sessions.findMany({
        take: 5,
        orderBy: { started_at: 'desc' },
        include: {
            metrics: true,
            summaries: true,
            _count: {
                select: { transcripts: true }
            }
        }
    });

    for (const s of sessions) {
        console.log("--------------------------------------------------");
        console.log(`ID: ${s.id}`);
        console.log(`Status: ${s.status}`);
        console.log(`Started: ${s.started_at}`);
        console.log(`Ended:   ${s.ended_at}`);
        console.log(`Transcripts Count: ${s._count.transcripts}`);

        if (s.metrics.length > 0) {
            console.log("Metrics:");
            s.metrics.forEach(m => {
                console.log(`  User ${m.user_id}: WordCount=${m.word_count}, SpeakingTime=${m.speaking_time}, Fillers=${m.filler_count}`);
            });
        } else {
            console.log("Metrics: NONE");
        }

        if (s.summaries.length > 0) {
            console.log("Summaries:");
            s.summaries.forEach(sum => {
                console.log(`  User ${sum.user_id}: Conf=${sum.confidence_score}, Fluency=${sum.fluency_score}`);
                console.log(`  Weaknesses: ${JSON.stringify(sum.weaknesses)}`);
                console.log(`  CreatedAt: ${sum.created_at}`);
            });
        } else {
            console.log("Summaries: NONE");
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
