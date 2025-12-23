'use client';

import { motion } from 'framer-motion';

interface ConfidenceMeterProps {
  label: string;
  initialLevel: number; // Between 0 and 1
  className?: string;
}

export function ConfidenceMeter({
  label,
  initialLevel,
  className = ''
}: ConfidenceMeterProps) {
  // Ensure initialLevel is between 0 and 1
  const clampedLevel = Math.max(0, Math.min(1, initialLevel));

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-300 to-purple-400 dark:from-indigo-400 dark:to-purple-500 rounded-full shadow-sm"
          initial={{ width: 0 }}
          animate={{ width: `${clampedLevel * 100}%` }}
          transition={{
            duration: 2.5,
            ease: "easeOut",
            delay: 0.3
          }}
        />
      </div>
    </div>
  );
}