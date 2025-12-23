"use client"
import { deleteTutor } from "@/app/actions/tutor";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteTutorButton({ tutorId }: { tutorId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!confirm("Are you sure? This will delete the tutor's account and login.")) return;

        setIsDeleting(true);
        const result = await deleteTutor(tutorId);

        if (result && result.success) {
            // Router refresh handles the UI update since server component re-renders
            // revalidatePath in action handles the data
        } else {
            alert("Error: " + (result?.error || "Unknown error"));
            setIsDeleting(false);
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
        >
            {isDeleting ? "Deleting..." : "Delete"}
        </button>
    );
}
