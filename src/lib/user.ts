import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) return null;

  // We find the user in our local DB using the Clerk ID
  // stored in the password_hash column (or a custom clerk_id column if you added one)
  const user = await prisma.users.findFirst({
    where: {
      clerkId: userId,
    },
    include: {
      tutor_profiles: true,
      student_profiles: true,
    },
  });

  return user;
}