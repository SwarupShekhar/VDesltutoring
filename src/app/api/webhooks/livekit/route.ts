import { WebhookReceiver } from 'livekit-server-sdk';
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

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook] Error validating webhook:', error);
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 401 });
  }
}
