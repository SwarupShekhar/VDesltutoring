import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const secret = req.headers.get('x-internal-secret');
  
  if (!secret || secret !== process.env.INTERNAL_BRIDGE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { clerkId: string; email: string; fullName: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { clerkId, email, fullName } = body;

  if (!clerkId || !email || !fullName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existingUser = await prisma.users.findUnique({
    where: { clerkId },
  });

  if (existingUser) {
    return NextResponse.json({ message: 'User already exists', userId: existingUser.id });
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        clerkId,
        email,
        full_name: fullName,
        role: 'LEARNER',
      },
    });

    await tx.student_profiles.create({
      data: {
        user_id: user.id,
        credits: 0,
      },
    });
  });

  return NextResponse.json({ message: 'User provisioned successfully' }, { status: 200 });
}