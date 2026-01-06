import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        // body should contain partial coach_memory fields
        // { focusSkill, lastWeakness, lastSessionSummary, ... }

        // Find user
        const user = await prisma.users.findUnique({ where: { clerkId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const currentMemory: any = (user as any).coach_memory || {};
        const newMemory = { ...currentMemory, ...body, lastUpdated: new Date() };

        await prisma.users.update({
            where: { clerkId },
            data: { coach_memory: newMemory } as any
        });

        return NextResponse.json({ success: true, memory: newMemory });
    } catch (error) {
        console.error('Failed to update coach memory:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
