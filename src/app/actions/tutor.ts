"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTutor(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const expertise = formData.get("expertise") as string;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.users.create({
        data: {
          email,
          full_name: name,
          role: 'TUTOR',
          clerkId: 'managed-by-clerk', // Clerk handles the actual auth
        },
      });

      // 2. Create Tutor Profile linked to that User
      await tx.tutor_profiles.create({
        data: {
          user_id: user.id,
          bio: `Specialist in ${expertise}`,
          expertise_tags: expertise.split(",").map(s => s.trim()),
        },
      });

      return user;
    });

    revalidatePath("/admin/tutors");
    return { success: true, user: result };
  } catch (error) {
    return { success: false, error: "Failed to create tutor" };
  }
}