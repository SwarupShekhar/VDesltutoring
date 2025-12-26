import { cookies } from "next/headers"

export default async function LearnerDashboard() {
    const cookieStore = cookies()
    const cookieHeader = cookieStore.toString()

    // Get user + credits
    const meRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/me`,
        { headers: { Cookie: cookieHeader } }
    )
    const me = await meRes.json()

    // Get tutoring sessions
    const sessionsRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/sessions?role=learner`,
        { headers: { Cookie: cookieHeader } }
    )
    const sessionsData = await sessionsRes.json()
    const tutoringSessions = sessionsData.sessions || []

    // Get fluency history
    const fluencyRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/fluency/history`,
        { headers: { Cookie: cookieHeader } }
    )
    const fluencyData = await fluencyRes.json()
    const fluencySessions = fluencyData.sessions || []

    return (
        <div className="p-8 space-y-10">
            <h1 className="text-3xl font-bold">Your Learning Dashboard</h1>

            {/* Credits */}
            <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                <h2 className="font-bold">Credits</h2>
                <p className="text-2xl text-blue-400">
                    {me.credits ?? 0}
                </p>
            </div>

            {/* Tutoring Sessions */}
            <div>
                <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>

                {tutoringSessions.length === 0 && (
                    <p className="text-gray-400">No sessions booked.</p>
                )}

                <ul className="space-y-3">
                    {tutoringSessions.map((s: any) => (
                        <li key={s.id} className="p-4 rounded bg-white/5 border border-white/10">
                            <div>{new Date(s.start_time).toLocaleString()}</div>
                            <div className="text-sm text-gray-400">
                                {s.status}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Fluency History */}
            <div>
                <h2 className="text-xl font-bold mb-4">Fluency History</h2>

                {fluencySessions.length === 0 && (
                    <p className="text-gray-400">No fluency sessions yet.</p>
                )}

                <ul className="space-y-3">
                    {fluencySessions.map((f: any) => (
                        <li key={f.id} className="p-4 rounded bg-white/5 border border-white/10">
                            <div className="flex justify-between">
                                <span>{new Date(f.created_at).toLocaleDateString()}</span>
                                <span className="font-bold text-blue-400">
                                    {Math.round(f.average_score)}%
                                </span>
                            </div>
                            <div className="text-sm text-gray-400">
                                {f.rounds.length} rounds
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
