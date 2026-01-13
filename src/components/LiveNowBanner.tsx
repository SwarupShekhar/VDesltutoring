'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LiveNowBanner.module.css';

export function LiveNowBanner({ locale }: { locale: string }) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/live-practice/stats');
                if (res.ok) {
                    const data = await res.json();
                    setCount(data.activeCount);
                }
            } catch (error) {
                console.error('Failed to fetch live stats', error);
            }
        };

        // Initial fetch
        fetchStats();

        // Poll every 10 seconds
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    // While loading, don't show anything to avoid flickering
    if (count === null) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full flex justify-center py-8 relative z-20 pointer-events-none"
            >
                <Link href={`/${locale}/live-practice`} className="pointer-events-auto">
                    <button type="button" className={styles.btn}>
                        <span className={styles.text}>
                            {count > 0 ? (
                                <>
                                    {count} learners practicing right now &rarr;
                                </>
                            ) : (
                                "Start the first live session now &rarr;"
                            )}
                        </span>
                        <div className={styles.containerStars}>
                            <div className={styles.stars} />
                        </div>
                        <div className={styles.glow}>
                            <div className={styles.circle} />
                            <div className={styles.circle} />
                        </div>
                    </button>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}
