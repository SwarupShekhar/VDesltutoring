require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding Fluency Exercises...');

    const exercises = [
        {
            weakness_tag: 'HESITATION',
            prompt: 'Describe your morning routine without pausing for more than 2 seconds.',
            difficulty: 'Medium'
        },
        {
            weakness_tag: 'HESITATION',
            prompt: 'Talk about your favorite movie continuously for 1 minute.',
            difficulty: 'Hard'
        },
        {
            weakness_tag: 'SPEED',
            prompt: 'Read this paragraph out loud as slowly and clearly as possible.',
            difficulty: 'Easy'
        },
        {
            weakness_tag: 'SPEED',
            prompt: 'Practice speaking with a metronome at 100 bpm.',
            difficulty: 'Medium'
        },
        {
            weakness_tag: 'GRAMMAR',
            prompt: 'Retell a story from the past using only past tense verbs.',
            difficulty: 'Medium'
        },
        {
            weakness_tag: 'VOCAB',
            prompt: 'Describe this image using at least 5 advanced adjectives.',
            difficulty: 'Hard'
        },
        {
            weakness_tag: 'CONFIDENCE',
            prompt: 'Give a 2-minute speech on a topic you are an expert on.',
            difficulty: 'Easy'
        }
    ];

    for (const ex of exercises) {
        // Check if exists to avoid dupes on re-run
        const exists = await prisma.fluency_exercises.findFirst({
            where: { prompt: ex.prompt }
        });

        if (!exists) {
            await prisma.fluency_exercises.create({ data: ex });
            console.log(`Created exercise: ${ex.prompt}`);
        }
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
