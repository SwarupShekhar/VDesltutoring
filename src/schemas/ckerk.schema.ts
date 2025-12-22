import { z } from "zod";

export const ClerkUserWebhookSchema = z.object({
  data: z.object({
    id: z.string(),
    email_addresses: z.array(
      z.object({
        email_address: z.string().email(),
      })
    ),
    username: z.string().nullable(),
    image_url: z.string().url().optional(),
  }),
  type: z.string(), // e.g., "user.created" or "user.updated"
});

// Create a type for use in your code
export type ClerkUserEvent = z.infer<typeof ClerkUserWebhookSchema>;