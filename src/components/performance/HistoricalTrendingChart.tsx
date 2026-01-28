'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SessionData {
    sessionId: string;
    date: string;
    scores: {
        cognitiveReflex: number;
        speechRhythm: number;
        languageMaturity: number;
        socialPresence: number;
        pressureStability: number;
    };
}

interface HistoricalTrendingChartProps {
    sessions: SessionData[];
    highlightedSystem?: string;
}

const SYSTEM_CONFIG = {
    cognitiveReflex: { name: 'Cognitive Reflex', color: '#3b82f6', key: 'cognitiveReflex' },
    speechRhythm: { name: 'Speech Rhythm', color: '#8b5cf6', key: 'speechRhythm' },
    languageMaturity: { name: 'Language Maturity', color: '#10b981', key: 'languageMaturity' },
    socialPresence: { name: 'Social Presence', color: '#f59e0b', key: 'socialPresence' },
    pressureStability: { name: 'Pressure Stability', color: '#ef4444', key: 'pressureStability' }
};

export function HistoricalTrendingChart({ sessions, highlightedSystem }: HistoricalTrendingChartProps) {
    if (!sessions || sessions.length === 0) {
        return (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-8 rounded-xl text-center">
                <p className="text-slate-500 dark:text-slate-400">
                    Complete 3+ sessions with performance analytics to see trending data.
                </p>
            </div>
        );
    }

    // Transform data for Recharts
    const chartData = sessions.map(session => ({
        date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...session.scores
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm"
        >
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-xl">📈</span>
                    Performance Trends
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Score progression over your last {sessions.length} sessions
                </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '12px' }}
                    />

                    {Object.entries(SYSTEM_CONFIG).map(([key, config]) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={config.key}
                            name={config.name}
                            stroke={config.color}
                            strokeWidth={highlightedSystem === key ? 3 : 2}
                            dot={{ r: highlightedSystem === key ? 5 : 3 }}
                            activeDot={{ r: 6 }}
                            opacity={highlightedSystem && highlightedSystem !== key ? 0.3 : 1}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>

            {highlightedSystem && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                        💡 <strong>{SYSTEM_CONFIG[highlightedSystem as keyof typeof SYSTEM_CONFIG]?.name}</strong> is your primary limiter.
                        Focus on this trend to track your improvement.
                    </p>
                </div>
            )}
        </motion.div>
    );
}
