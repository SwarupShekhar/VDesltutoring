import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  const secret = req.headers.get('x-internal-secret');

  if (!secret || secret !== process.env.BRIDGE_INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { clerkId: string; cefrLevel: string; fluencyScore: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { clerkId, cefrLevel, fluencyScore } = body;

  if (!clerkId || !cefrLevel) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user_fluency_profile.upsert({
      where: { user_id: user.id },
      update: {
        cefr_level: cefrLevel,
        fluency_score: fluencyScore,
      },
      create: {
        user_id: user.id,
        cefr_level: cefrLevel,
        fluency_score: fluencyScore,
        confidence: 0.8,
        pause_ratio: 0.1,
        word_count: 0,
        source_type: 'bridge_sync',
      },
    });

    console.log(`[update-cefr] Updated user ${clerkId} to ${cefrLevel}`);
    return NextResponse.json({ status: 'updated' });

  } catch (error) {
    console.error('[update-cefr] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
