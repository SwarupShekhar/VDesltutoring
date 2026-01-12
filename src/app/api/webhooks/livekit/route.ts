import { WebhookReceiver } from 'livekit-server-sdk';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY || '',
  process.env.LIVEKIT_API_SECRET || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    const event = await receiver.receive(body, authHeader);
    console.log(`[Webhook] LiveKit event: ${event.event} for room ${event.room?.name}`);

    if (event.event === 'participant_left' || event.event === 'room_finished') {
      const roomName = event.room?.name;
      if (!roomName) return NextResponse.json({ status: 'ok' });

      // Find session by room name
      const session = await prisma.live_sessions.findFirst({
        where: {
          room_name: roomName,
          status: { not: 'ended' }
        }
      });

      if (session) {
        console.log(`[Webhook] Ending session ${session.id} due to ${event.event}`);
        // Mark session as ended
        await prisma.live_sessions.update({
          where: { id: session.id },
          data: {
            status: 'ended',
            ended_at: new Date()
          }
        });

        // Clean up any remaining queue entries for these users if they exist (just in case)
        await prisma.live_queue.deleteMany({
          where: {
            user_id: { in: [session.user_a, session.user_b] }
          }
        });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook] Error validating webhook:', error);
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 401 });
  }
}
