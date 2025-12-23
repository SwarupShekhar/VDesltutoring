
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('--- DIAGNOSING SESSIONS ---');
    const sessions = await prisma.sessions.findMany({
        include: {
            tutor_profiles: {
                include: { users: true }
            }
        }
    });

    for (const s of sessions) {
        if (s.status === 'SCHEDULED' || !s.tutor_id) {
            console.log(`ID: ${s.id}`);
            console.log(`  Status: ${s.status}`);
            console.log(`  TutorID (Raw): ${s.tutor_id}`);
            console.log(`  Tutor Profile: ${s.tutor_profiles ? 'FOUND' : 'NULL'}`);
            if (s.tutor_profiles) {
                console.log(`  Tutor Name: ${s.tutor_profiles.users?.full_name}`);
            }
            console.log('---');
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
