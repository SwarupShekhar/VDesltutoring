"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";

export async function createTutor(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const expertise = formData.get("expertise") as string;

  try {
    // 1. Create User in Clerk
    const clerkUser = await (await clerkClient()).users.createUser({
      emailAddress: [email],
      password: password,
      firstName: name.split(" ")[0],
      lastName: name.split(" ").slice(1).join(" ") || "",
      publicMetadata: { role: 'TUTOR' },
      skipPasswordChecks: true,
    });

    // 2. Create User in DB (sequentially)
    const user = await prisma.users.create({
      data: {
        clerkId: clerkUser.id,
        email,
        full_name: name,
        role: 'TUTOR',
        is_active: true,
      },
    });

    // 3. Create Tutor Profile
    await prisma.tutor_profiles.create({
      data: {
        user_id: user.id,
        bio: `Specialist in ${expertise}`,
        expertise_tags: expertise.split(",").map(s => s.trim()),
      },
    });

    revalidatePath("/admin/tutors");
    return { success: true, user, credentials: { email, password } };

  } catch (error) {
    console.error("Create Tutor Error:", JSON.stringify(error, null, 2));
    let errorMessage = "Failed to create tutor";
    if (error && typeof error === 'object' && 'errors' in error && Array.isArray((error as any).errors) && (error as any).errors.length > 0) {
      errorMessage = (error as any).errors[0].message || "Failed to create tutor (Clerk error)";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function deleteTutor(tutorId: string) {
  try {
    const tutorProfile = await prisma.tutor_profiles.findUnique({
      where: { id: tutorId },
      include: { users: true }
    });

    if (!tutorProfile || !tutorProfile.users) {
      return { success: false, error: "Tutor not found" };
    }

    const clerkId = tutorProfile.users.clerkId;

    // 1. Delete from Clerk (if exists)
    if (clerkId) {
      try {
        await (await clerkClient()).users.deleteUser(clerkId);
      } catch (e) {
        console.error("Failed to delete Clerk user:", e);
        // Continue to delete from DB even if Clerk fails (consistency)
      }
    }

    // 2. Delete from DB (Cascade will remove profile)
    await prisma.users.delete({
      where: { id: tutorProfile.users.id }
    });

    revalidatePath("/admin/tutors");
    return { success: true };

  } catch (error) {
    console.error("Delete Tutor Error:", error);
    return { success: false, error: "Failed to delete tutor" };
  }
}