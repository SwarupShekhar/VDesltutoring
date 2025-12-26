import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#020617] text-white">
            <h1 className="text-4xl font-bold mb-8">ESL Tutoring Platform</h1>
            <div className="flex gap-4">
                <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                >
                    Go to Dashboard
                </Link>
                <Link
                    href="/practice"
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition"
                >
                    Practice Fluency
                </Link>
            </div>
        </main>
    );
}
