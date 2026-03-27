import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret');
  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clerkId, email, fullName } = await req.json();

  if (!clerkId || !email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    const existing = await prisma.users.findUnique({ where: { clerkId } });
    if (existing) return NextResponse.json({ status: 'already_exists' });

    await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          clerkId,
          email,
          full_name: fullName ?? email,
          role: 'LEARNER',
          is_active: true,
        },
      });
      await tx.student_profiles.create({
        data: { user_id: user.id, credits: 0 },
      });
    });

    return NextResponse.json({ status: 'provisioned' });
  } catch (error) {
    console.error('Englivo provision error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
