require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const drills = [
    {
        weakness_tag: "HESITATION",
        prompt: "Speak for 60 seconds about your favorite hobby without pausing for more than 2 seconds.",
        difficulty: "Beginner"
    },
    {
        weakness_tag: "HESITATION",
        prompt: "Describe your morning routine in detail, focusing on continuous flow.",
        difficulty: "Intermediate"
    },
    {
        weakness_tag: "SPEED",
        prompt: "Read this paragraph aloud, trying to maintain a steady pace of 130 words per minute.",
        difficulty: "Beginner"
    },
    {
        weakness_tag: "SPEED",
        prompt: "Summarize a recent news article in under 1 minute.",
        difficulty: "Advanced"
    },
    {
        weakness_tag: "GRAMMAR",
        prompt: "Describe what you did yesterday using only past tense verbs.",
        difficulty: "Intermediate"
    },
    {
        weakness_tag: "GRAMMAR",
        prompt: "Explain your future career plans using 'going to' and 'will' correctly.",
        difficulty: "Intermediate"
    },
    {
        weakness_tag: "CONFIDENCE",
        prompt: "Give a 30-second speech on why you deserve a promotion.",
        difficulty: "Advanced"
    },
    {
        weakness_tag: "CONFIDENCE",
        prompt: "Introduce yourself to a stranger in a professional setting.",
        difficulty: "Beginner"
    },
    {
        weakness_tag: "PASSIVITY",
        prompt: "Debate this topic: 'Technology does more harm than good' for 2 minutes.",
        difficulty: "Advanced"
    }
];

async function main() {
    console.log("Seeding fluency exercises...");
    for (const drill of drills) {
        await prisma.fluency_exercises.create({
            data: drill
        });
    }
    console.log("Seeding complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
