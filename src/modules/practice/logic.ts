/**
 * Practice Module - Logic
 * 
 * Core business logic for practice mode.
 */

import { getDifficultySettings } from '@/engines/coaching/adaptiveDifficulty'
import type { PracticeItem, DifficultySettings } from './types'

// Expanded practice library with difficulty levels
export const PRACTICE_LIBRARY: PracticeItem[] = [
    // --- SIMPLE (for struggling users) ---
    {
        id: "simple-1",
        type: "LISTEN_REACT",
        situation: "Daily Life",
        difficulty: 1,
        complexity: "simple",
        prompt: "What did you eat today?",
    },
    {
        id: "simple-2",
        type: "QUICK_RESPONSE",
        situation: "Daily Life",
        difficulty: 1,
        complexity: "simple",
        prompt: "How is the weather today?",
    },
    {
        id: "simple-3",
        type: "OPINION",
        situation: "Daily Life",
        difficulty: 1,
        complexity: "simple",
        prompt: "Do you like coffee or tea?",
    },
    {
        id: "simple-4",
        type: "QUICK_RESPONSE",
        situation: "Daily Life",
        difficulty: 1,
        complexity: "simple",
        prompt: "What is your favorite color and why?",
    },
    {
        id: "simple-5",
        type: "OPINION",
        situation: "Home",
        difficulty: 1,
        complexity: "simple",
        prompt: "Describe your room.",
    },
    {
        id: "simple-6",
        type: "LISTEN_REACT",
        situation: "Social",
        difficulty: 1,
        complexity: "simple",
        prompt: "Do you have any pets?",
    },

    // --- MODERATE (default) ---
    {
        id: "travel-1",
        type: "LISTEN_REACT",
        situation: "Travel",
        difficulty: 2,
        complexity: "moderate",
        prompt: "You are at an airport. Someone asks: 'Where are you flying today?' Answer naturally.",
    },
    {
        id: "work-1",
        type: "FINISH_THOUGHT",
        situation: "Work",
        difficulty: 2,
        complexity: "moderate",
        prompt: "Finish this sentence: 'I think this project is important because…'",
    },
    {
        id: "social-1",
        type: "PICK_SPEAK",
        situation: "Daily Life",
        difficulty: 2,
        complexity: "moderate",
        prompt: "Choose one and speak for 10 seconds: coffee, weekend, your city",
        choices: ["coffee", "weekend", "your city"],
    },
    {
        id: "memorable-1",
        type: "STORYTELLING",
        situation: "Personal",
        difficulty: 2,
        complexity: "moderate",
        prompt: "Describe a memorable vacation you took.",
    },
    {
        id: "advice-1",
        type: "OPINION",
        situation: "Life",
        difficulty: 2,
        complexity: "moderate",
        prompt: "What is the best advice you've ever received?",
    },
    {
        id: "work-style-1",
        type: "OPINION",
        situation: "Work",
        difficulty: 2,
        complexity: "moderate",
        prompt: "Do you prefer working alone or in a team? Why?",
    },
    {
        id: "stress-1",
        type: "EXPLANATION",
        situation: "Health",
        difficulty: 2,
        complexity: "moderate",
        prompt: "How do you handle stress?",
    },

    // --- COMPLEX (for high performers) ---
    {
        id: "interview-1",
        type: "ROLEPLAY",
        situation: "Interviews",
        difficulty: 3,
        complexity: "complex",
        prompt: "You are in a job interview. Answer: 'Tell me about yourself and why you're the best fit for this position.'",
    },
    {
        id: "debate-1",
        type: "DEBATE",
        situation: "Discussion",
        difficulty: 3,
        complexity: "complex",
        prompt: "Make an argument: Should remote work be the default option for office jobs? Speak for 30 seconds.",
    },
    {
        id: "story-1",
        type: "STORYTELLING",
        situation: "Social",
        difficulty: 3,
        complexity: "complex",
        prompt: "Tell a story about a time you faced a challenge and how you overcame it.",
    },
    {
        id: "explain-1",
        type: "EXPLANATION",
        situation: "Professional",
        difficulty: 3,
        complexity: "complex",
        prompt: "Explain a concept from your work or hobby to someone who knows nothing about it.",
    },
    {
        id: "social-media-1",
        type: "DEBATE",
        situation: "Society",
        difficulty: 3,
        complexity: "complex",
        prompt: "Discuss the impact of social media on society. Is it mostly positive or negative?",
    },
    {
        id: "law-change-1",
        type: "OPINION",
        situation: "Society",
        difficulty: 3,
        complexity: "complex",
        prompt: "If you could change one law in your country, what would it be and why?",
    },
    {
        id: "environment-1",
        type: "EXPLANATION",
        situation: "Environment",
        difficulty: 3,
        complexity: "complex",
        prompt: "Explain why environmental conservation is important.",
    },

    // --- SIMPLE (Comprehension & Completion) ---
    {
        id: "comp-daily-1",
        type: "LISTEN_TYPE",
        situation: "Daily Life",
        difficulty: 1,
        complexity: "simple",
        prompt: "Listen and type exactly what you hear.",
        audioUrl: "https://res.cloudinary.com/de8vvmpip/video/upload/v1767344776/Daily-1_wntyhz.mp3"
    },
    {
        id: "comp-social-1",
        type: "LISTEN_TYPE",
        situation: "Social",
        difficulty: 1,
        complexity: "simple",
        prompt: "Listen and type exactly what you hear.",
        audioUrl: "https://res.cloudinary.com/de8vvmpip/video/upload/v1767345920/smalltalk-1_gblmkg.mp3"
    },
    {
        id: "complete-1",
        type: "COMPLETE_SENTENCE",
        situation: "Daily Life",
        difficulty: 1,
        complexity: "simple",
        prompt: "Complete the sentence: 'I am happy because...'"
    },
    {
        id: "complete-2",
        type: "COMPLETE_SENTENCE",
        situation: "Daily Life",
        difficulty: 1,
        complexity: "simple",
        prompt: "Complete the sentence: 'My favorite food is...'"
    },

    // --- MODERATE (Comprehension & Completion) ---
    {
        id: "comp-work-1",
        type: "LISTEN_TYPE",
        situation: "Work",
        difficulty: 2,
        complexity: "moderate",
        prompt: "Listen and type exactly what you hear.",
        audioUrl: "https://res.cloudinary.com/de8vvmpip/video/upload/v1767344857/Work-1_o98rh1.mp3"
    },
    {
        id: "comp-travel-1",
        type: "LISTEN_TYPE",
        situation: "Travel",
        difficulty: 2,
        complexity: "moderate",
        prompt: "Listen and type exactly what you hear.",
        audioUrl: "https://res.cloudinary.com/de8vvmpip/video/upload/v1767345066/Travel-1_wsvjsf.mp3"
    },
    {
        id: "complete-3",
        type: "COMPLETE_SENTENCE",
        situation: "Work",
        difficulty: 2,
        complexity: "moderate",
        prompt: "Complete the sentence: 'The meeting was delayed due to...'"
    },
    {
        id: "complete-4",
        type: "COMPLETE_SENTENCE",
        situation: "Travel",
        difficulty: 2,
        complexity: "moderate",
        prompt: "Complete the sentence: 'If I miss my flight, I will...'"
    },

    // --- COMPLEX (Comprehension & Completion) ---
    {
        id: "comp-office-1",
        type: "LISTEN_TYPE",
        situation: "Office",
        difficulty: 3,
        complexity: "complex",
        prompt: "Listen and type exactly what you hear.",
        audioUrl: "https://res.cloudinary.com/de8vvmpip/video/upload/v1767346149/Office-1_xo981e.mp3"
    },
    {
        id: "complete-5",
        type: "COMPLETE_SENTENCE",
        situation: "Abstract",
        difficulty: 3,
        complexity: "complex",
        prompt: "Complete the sentence: 'The biggest challenge facing society is...'"
    },
]

/**
 * Get a practice turn based on fluency score
 */
export function getPracticeTurn(fluencyScore: number = 0.5): PracticeItem & { difficultySettings: Omit<DifficultySettings, 'complexity'> } {
    const settings = getDifficultySettings(fluencyScore)

    // Filter prompts by complexity
    const filteredPrompts = PRACTICE_LIBRARY.filter(p => p.complexity === settings.complexity)

    // Fallback to all prompts if no match
    const pool = filteredPrompts.length > 0 ? filteredPrompts : PRACTICE_LIBRARY

    // Pick random turn
    const turn = pool[Math.floor(Math.random() * pool.length)]

    return {
        ...turn,
        difficultySettings: {
            level: settings.level,
            prepTime: settings.prepTime,
            promptSpeed: settings.promptSpeed
        }
    }
}

/**
 * Get all practice items for a specific complexity
 */
export function getPracticeItemsByComplexity(complexity: 'simple' | 'moderate' | 'complex'): PracticeItem[] {
    return PRACTICE_LIBRARY.filter(p => p.complexity === complexity)
}

/**
 * Get practice items by situation
 */
export function getPracticeItemsBySituation(situation: string): PracticeItem[] {
    return PRACTICE_LIBRARY.filter(p => p.situation.toLowerCase() === situation.toLowerCase())
}
