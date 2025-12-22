'use client';

import { useState, useEffect } from 'react';
import { ConversationalHero } from '@/components/ConversationalHero';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface HeroCardProps {
  className?: string;
}

export function HeroCard({ className = '' }: HeroCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className={`text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          A calm first ESL lesson.<br />
          <span className="text-indigo-600 dark:text-indigo-400">We speak slowly. We wait with you.</span>
        </h1>
        <p className={`text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto transition-all duration-1000 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Your tutor guides you through real phrases, not scripts. Pauses are welcomed, mistakes are expected, and every sentence is built together.
        </p>
        
        {/* Conversational Animation */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <ConversationalHero />
        </div>
        
        <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link href="/sign-up">
            <Button size="lg" className="px-8 py-6 text-base rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Try a guided first lesson
            </Button>
          </Link>
          <Link href="/sessions/book">
            <Button size="lg" variant="outline" className="px-8 py-6 text-base rounded-xl border-2 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              See how a first session feels
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}