"use client"
import { createTutor } from "@/app/actions/tutor";
import { useState } from "react";

export default function AddTutorPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("Saving...");
    const result = await createTutor(formData);
    if (result.success) {
      setStatus("✅ Tutor Onboarded Successfully!");
    } else {
      setStatus("❌ Error: " + result.error);
    }
  }

  return (
    <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6">Onboard a New Tutor</h2>
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input name="name" type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input name="email" type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Expertise (e.g. TOEFL, IELTS)</label>
          <input name="expertise" type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
          Create Tutor Profile
        </button>
      </form>
      
      {status && <p className="mt-4 font-medium text-center">{status}</p>}
    </div>
  );
}