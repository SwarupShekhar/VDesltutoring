
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('--- DIAGNOSING TUTORS ---');

    // 1. Find all users with role 'TUTOR'
    const tutorUsers = await prisma.users.findMany({
        where: { role: 'TUTOR' },
        include: { tutor_profiles: true }
    });

    console.log(`Found ${tutorUsers.length} users with role 'TUTOR'`);

    for (const u of tutorUsers) {
        console.log(`User: ${u.full_name} (${u.email})`);
        if (u.tutor_profiles) {
            console.log(`  ✅ Has Tutor Profile: ${u.tutor_profiles.id}`);
        } else {
            console.log(`  ❌ MISSING Tutor Profile! This user will not appear in the assignment list.`);
        }
    }

    // 2. Count actual profiles
    const profiles = await prisma.tutor_profiles.count();
    console.log(`Total tutor_profiles records: ${profiles}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
