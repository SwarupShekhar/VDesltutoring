
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('--- TEST ASSIGNMENT ---');

    // 1. Get the problematic session
    const sessionId = '609cf356-b459-41aa-a115-ff84c185ef42';
    const session = await prisma.sessions.findUnique({ where: { id: sessionId } });

    if (!session) {
        console.error('Session not found!');
        return;
    }
    console.log(`Session found: ${session.id}, Current Tutor: ${session.tutor_id}`);

    // 2. Get a tutor
    const tutor = await prisma.tutor_profiles.findFirst();
    if (!tutor) {
        console.error('No tutors found!');
        return;
    }
    console.log(`Assigning Tutor: ${tutor.id}`);

    // 3. Perform Update
    try {
        const updated = await prisma.sessions.update({
            where: { id: sessionId },
            data: {
                tutor_id: tutor.id,
                status: 'SCHEDULED' // Ensure status is set
            }
        });
        console.log(`Update success! New Tutor ID: ${updated.tutor_id}`);

        // 4. Verify Read
        const verify = await prisma.sessions.findUnique({ where: { id: sessionId } });
        console.log(`Verify Read: ${verify?.tutor_id}`);

    } catch (e) {
        console.error('Update failed:', e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
