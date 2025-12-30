'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface Phrase {
  text: string;
  emphasis?: boolean;
}

interface Sentence {
  context: string;
  phrases: Phrase[];
}

interface Scene {
  context: string;
  thought: string;
  phrases: Phrase[];
}

const SCENES: Scene[] = [
  {
    context: "You're in a meeting. Everyone is waiting.",
    thought: "You know what you want to say - but you're not sure how to start.",
    phrases: [
      { text: "Um…" },
      { text: "I just wanted to" },
      { text: "clarify one thing" },
      { text: "before we move on." }
    ]
  },
  {
    context: "Someone asks you a question you didn't expect.",
    thought: "You're thinking in your language first.",
    phrases: [
      { text: "Let me think" },
      { text: "I believe" },
      { text: "the main issue" },
      { text: "is the timeline." }
    ]
  },
  {
    context: "You're not sure your English is correct.",
    thought: "But you don't want to stay silent.",
    phrases: [
      { text: "I might be wrong," },
      { text: "but from my experience," },
      { text: "this approach" },
      { text: "works better." }
    ]
  }
];

export function InteractiveSentenceBuilder() {
  const prefersReducedMotion = useReducedMotion();
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [visiblePhrases, setVisiblePhrases] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;

    const scene = SCENES[currentSceneIndex];
    const maxPhrases = scene.phrases.length;

    // If we've shown all phrases in current scene, move to next scene
    if (visiblePhrases >= maxPhrases) {
      const timer = setTimeout(() => {
        // Move to next scene or loop back to first
        const nextIndex = (currentSceneIndex + 1) % SCENES.length;
        setCurrentSceneIndex(nextIndex);
        setVisiblePhrases(0);
      }, prefersReducedMotion ? 1400 : 4200); // Slightly slower, calmer pause

      return () => clearTimeout(timer);
    }

    // Show next phrase
    const timer = setTimeout(() => {
      setVisiblePhrases(prev => prev + 1);
    }, prefersReducedMotion ? 0 : 700); // Slightly slower reveal cadence

    return () => clearTimeout(timer);
  }, [currentSceneIndex, visiblePhrases, isAnimating]);

  const currentScene = SCENES[currentSceneIndex];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          What speaking English actually feels like
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          If you hesitate or pause, that&apos;s normal. Here&apos;s how confident speakers build sentences in real moments.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
        <div className="min-h-[220px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSceneIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.25, 0.1, 0.25, 1],
                delay: prefersReducedMotion ? 0 : 0.08
              }}
              className="text-center"
            >
              <div className="mb-4">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">Situation</p>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{currentScene.context}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">What you might be thinking</p>
                <p className="text-gray-700 dark:text-gray-300 italic">{currentScene.thought}</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-3 text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-200 min-h-[60px]">
                <AnimatePresence>
                  {(prefersReducedMotion ? currentScene.phrases : currentScene.phrases.slice(0, visiblePhrases)).map((phrase, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ 
                        duration: 0.65, 
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: prefersReducedMotion ? 0 : index * 0.22
                      }}
                      className="font-medium"
                    >
                      {phrase.text}
                    </motion.span>
                  ))}
                  {visiblePhrases < currentScene.phrases.length && !prefersReducedMotion && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ 
                        duration: 1.6, 
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut"
                      }}
                      className="inline-block w-1 h-6 bg-indigo-400 dark:bg-indigo-500 ml-1"
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}