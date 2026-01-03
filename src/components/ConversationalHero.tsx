'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: number;
  text: string;
  sender: 'learner' | 'tutor';
  delay: number;
}

const CONVERSATION: Message[] = [
  { id: 1, text: "Hi, I want to improve my English.", sender: 'learner', delay: 500 },
  { id: 2, text: "Great! Let's practice together.", sender: 'tutor', delay: 2000 },
  { id: 3, text: "That sounds good 😊", sender: 'learner', delay: 4000 },
];

export function ConversationalHero() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    CONVERSATION.forEach((message, index) => {
      timers.push(
        setTimeout(() => {
          setCurrentMessageIndex(index);
          setIsTyping(true);
          setDisplayedText('');

          // Simulate typing effect
          let charIndex = 0;
          const typeInterval = setInterval(() => {
            if (charIndex < message.text.length) {
              setDisplayedText(message.text.substring(0, charIndex + 1));
              charIndex++;
            } else {
              clearInterval(typeInterval);
              setIsTyping(false);
            }
          }, 40); // 40ms per character for a calm, human pace

          timers.push(typeInterval);
        }, message.delay)
      );
    });

    return () => {
      timers.forEach(timer => {
        if (typeof timer === 'number') {
          clearTimeout(timer);
        } else {
          clearInterval(timer);
        }
      });
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 md:px-0">
      <div className="space-y-4">
        {CONVERSATION.map((message, index) => (
          <AnimatePresence key={message.id}>
            {(currentMessageIndex !== null && index <= currentMessageIndex) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`flex ${message.sender === 'learner' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${message.sender === 'learner'
                      ? 'bg-indigo-500 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                    }`}
                >
                  {index === currentMessageIndex && isTyping ? (
                    <div className="flex items-center">
                      <span>{displayedText}</span>
                      <motion.span
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                        className="ml-1 inline-block w-2 h-2 bg-current rounded-full"
                      />
                    </div>
                  ) : index < currentMessageIndex || (index === currentMessageIndex && !isTyping) ? (
                    <span>{message.text}</span>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && currentMessageIndex !== null && currentMessageIndex < CONVERSATION.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-2xl rounded-bl-none">
                <div className="flex space-x-1">
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}