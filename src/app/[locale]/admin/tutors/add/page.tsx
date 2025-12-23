"use client"
import { createTutor } from "@/app/actions/tutor";
import { useState } from "react";

export default function AddTutorPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ email: string, password: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("Saving...");
    const result = await createTutor(formData);
    if (result.success) {
      // @ts-ignore - credentials might not be in the type yet
      if (result.credentials) {
        setStatus(null); // Clear simple status
        setCredentials(result.credentials);
      } else {
        setStatus("✅ Tutor Onboarded Successfully!");
      }
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
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="flex gap-2">
            <input
              name="password"
              type="text"
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50"
              defaultValue={credentials?.password || ''}
            />
            <button
              type="button"
              onClick={() => {
                const randomPass = 'Tr!' + Math.random().toString(36).slice(-8) + '99';
                const input = document.querySelector('input[name="password"]') as HTMLInputElement;
                if (input) input.value = randomPass;
              }}
              className="mt-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition"
            >
              Generate
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Use a unique password to avoid Clerk "Data Breach" errors.</p>
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

      {credentials && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-bold mb-2">✅ Tutor Created! Share these credentials:</h3>
          <div className="bg-white p-3 rounded border border-gray-200 text-sm font-mono text-gray-800">
            <p>Email: <span className="font-bold select-all">{credentials.email}</span></p>
            <p>Password: <span className="font-bold select-all">{credentials.password}</span></p>
          </div>
          <p className="text-xs text-green-700 mt-2">The tutor can now log in with these details.</p>
        </div>
      )}
    </div>
  );
}