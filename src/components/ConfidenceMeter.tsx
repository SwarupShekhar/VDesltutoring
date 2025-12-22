'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

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
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure initialLevel is between 0 and 1
  const clampedLevel = Math.max(0, Math.min(1, initialLevel));

  // Define colors based on theme
  const backgroundColor = theme === 'dark' 
    ? 'bg-gray-700' 
    : 'bg-gray-200';
    
  const fillColor = theme === 'dark'
    ? 'from-indigo-400 to-purple-500'
    : 'from-indigo-300 to-purple-400';

  if (!mounted) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </div>
        <div className={`h-3 ${backgroundColor} rounded-full overflow-hidden`}>
          <div 
            className="h-full bg-gradient-to-r from-indigo-300 to-purple-400 rounded-full"
            style={{ width: `${clampedLevel * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </div>
      <div className={`h-3 ${backgroundColor} rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${fillColor} rounded-full shadow-sm`}
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