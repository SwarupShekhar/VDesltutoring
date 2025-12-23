import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ClerkUserWebhookSchema } from '@/schemas/ckerk.schema';
import { apiResponse } from '@/schemas/api.schema';

// Zod Schema for Clerk webhook validation
const userWebhookSchema = z.object({
  id: z.string(),
  email_addresses: z.array(z.object({
    email_address: z.string().email()
  })),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // Get headers for Svix verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  // Get and verify the payload
  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Error occured', { status: 400 });
  }

  // Handle Clerk webhook events
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const validatedData = userWebhookSchema.parse(evt.data);
    const fullName = [validatedData.first_name, validatedData.last_name]
      .filter(Boolean)
      .join(' ') || 'User';

    // Create user in database with clerkId AND default student profile
    await prisma.users.create({
      data: {
        clerkId: validatedData.id,
        email: validatedData.email_addresses[0].email_address,
        full_name: fullName,
        profile_image_url: validatedData.image_url,
        role: 'LEARNER',
        student_profiles: {
          create: {
            credits: 10, // Default free credits
            learning_goals: "Getting started",
          }
        }
      },
    });
  }

  if (eventType === 'user.updated') {
    const validatedData = userWebhookSchema.parse(evt.data);
    const fullName = [validatedData.first_name, validatedData.last_name]
      .filter(Boolean)
      .join(' ') || 'User';

    // Update user in database
    await prisma.users.update({
      where: { clerkId: validatedData.id },
      data: {
        email: validatedData.email_addresses[0].email_address,
        full_name: fullName,
        profile_image_url: validatedData.image_url,
        last_login: new Date(),
        // Note: role is NOT updated from Clerk - we control roles internally
      },
    });
  }

  if (eventType === 'user.deleted') {
    const validatedData = z.object({ id: z.string() }).parse(evt.data);

    // Soft delete or hard delete based on your needs
    await prisma.users.update({
      where: { clerkId: validatedData.id },
      data: {
        is_active: false,
        // Related profiles will cascade delete due to schema settings
      },
    });
  }

  return new Response('', { status: 200 });
}