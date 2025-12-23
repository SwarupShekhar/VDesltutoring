'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ArrowRight, Sparkles, RefreshCcw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// --- CONSTANTS & DATA ---

// ⚠️ PEDAGOGY RULE: Assessment content must remain English-only
// Jumbled sentences, word bubbles, draggable fragments, and example sentences must be hard-coded English strings.
// Do not move these to i18n dictionaries.


const SCENARIO_PROMPTS = [
    "You are asked unexpectedly in a meeting:",
    "A client suddenly asks you:",
    "Your manager turns to you and says:",
    "During a Q&A session, someone asks:"
];

const QUESTIONS = [
    "Can you explain why this was delayed?",
    "What’s your view on this approach?",
    "Do you think this solution will work?",
    "Can you walk us through what happened?"
];

const EMPATHY_PROMPTS = [
    "Many fluent speakers pause here too.",
    "It’s normal to think before starting.",
    "There’s no rush — this mirrors real conversation."
];

type Role = 'BUFFER' | 'STANCE' | 'EVENT' | 'CAUSE';

interface SentenceVariant {
    id: string;
    fullSentence: string;
    fragments: string[];
    roleMap: Record<string, Role>;
}

const SENTENCE_VARIANTS: SentenceVariant[] = [
    {
        id: "delay_explanation",
        fullSentence: "That’s a fair question — I think the delay happened because we had to revise the initial plan.",
        fragments: [
            "because we had to revise the initial plan",
            "I think",
            "the delay happened",
            "That’s a fair question —"
        ],
        roleMap: {
            "That’s a fair question —": "BUFFER",
            "I think": "STANCE",
            "the delay happened": "EVENT",
            "because we had to revise the initial plan": "CAUSE"
        }
    },
    {
        id: "opinion_softening",
        fullSentence: "I might be wrong, but it seems like this approach could save us time.",
        fragments: [
            "this approach could save us time",
            "I might be wrong, but",
            "it seems like"
        ],
        roleMap: {
            "I might be wrong, but": "BUFFER",
            "it seems like": "STANCE",
            "this approach could save us time": "EVENT"
        }
    },
    {
        id: "issue_explanation",
        fullSentence: "Let me explain — we ran into an issue when the requirements changed.",
        fragments: [
            "when the requirements changed",
            "we ran into an issue",
            "Let me explain —"
        ],
        roleMap: {
            "Let me explain —": "BUFFER",
            "we ran into an issue": "EVENT",
            "when the requirements changed": "CAUSE"
        }
    },
    {
        id: "decision_uncertainty",
        fullSentence: "From what I understand, we’re still waiting on confirmation before moving forward.",
        fragments: [
            "before moving forward",
            "we’re still waiting on confirmation",
            "From what I understand,"
        ],
        roleMap: {
            "From what I understand,": "BUFFER",
            "we’re still waiting on confirmation": "EVENT",
            "before moving forward": "CAUSE"
        }
    }
];

type PatternType = 'TRANSLATION_FIRST' | 'NATURAL_BUT_UNSTRUCTURED' | 'FLOW_ORIENTED' | 'CAREFUL_CONSTRUCTOR';

const FEEDBACK_DATA: Record<PatternType, { title: string; explanation: string; difficulty: string; fluentStrategy: string; takeaway: string }> = {
    TRANSLATION_FIRST: {
        title: "You explain before you enter.",
        explanation: "You focus on the 'Event' or 'Cause' first. This strategy creates high cognitive load because you are trying to construct the complex part of the sentence before you've acknowledged the question.",
        difficulty: "Silence grows while you prepare the sentence, which can increase feelings of pressure.",
        fluentStrategy: "They begin with short 'Buffer' phrases to buy thinking time.",
        takeaway: "Start with phrases like 'That’s a fair question...' before explaining."
    },
    NATURAL_BUT_UNSTRUCTURED: {
        title: "You have the right instinct.",
        explanation: "You started well with a buffer or stance, which is great. You entered the conversation correctly but the structure of the complex details became a bit heavy.",
        difficulty: "This pattern creates stress mid-sentence as you look for the right words.",
        fluentStrategy: "They use a modular structure: Buffer → Stance → Event → Cause.",
        takeaway: "Trust your starting phrase, then move to your Stance ('I think...')."
    },
    FLOW_ORIENTED: {
        title: "You are a Flow Architect.",
        explanation: "This is a highly effective strategy. You prioritized connection (Buffer) and perspective (Stance) before diving into the heavy details (Event/Cause).",
        difficulty: "This is the ideal state, though challenging to maintain under real pressure.",
        fluentStrategy: "This IS the fluent strategy.",
        takeaway: "Your challenge now is to apply this even when you are nervous."
    },
    CAREFUL_CONSTRUCTOR: {
        title: "The Careful Constructor",
        explanation: "You prioritize accuracy and precision. You prefer to arrange elements perfectly before committing to speech.",
        difficulty: "This strategy lengthens the silence before you speak.",
        fluentStrategy: "They speak *while* they think, rather than thinking *then* speaking.",
        takeaway: "Don't wait for perfection. Start with what you have."
    }
};


export const FluencyMirror = () => {
    // Stage Management
    const [stage, setStage] = useState<'idle' | 'scenario' | 'builder' | 'analyzing' | 'feedback'>('idle');

    // Context Data
    const [scenarioText, setScenarioText] = useState("");
    const [questionText, setQuestionText] = useState("");
    const [variant, setVariant] = useState<SentenceVariant | null>(null);
    const [items, setItems] = useState<string[]>([]);

    // Safety & Empathy State
    const [hasInteracted, setHasInteracted] = useState(false);
    const [empathyMessage, setEmpathyMessage] = useState<string | null>(null);
    const [hesitationPreamble, setHesitationPreamble] = useState<string | null>(null);

    // Timing & Metrics
    const timings = useRef<{ shown: number; firstMove: number | null }>({ shown: 0, firstMove: null });
    const [pattern, setPattern] = useState<PatternType | null>(null);

    // Initialization
    useEffect(() => {
        startNewSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startNewSession = () => {
        setStage('idle');
        setPattern(null);
        setHasInteracted(false);
        setEmpathyMessage(null);
        setHesitationPreamble(null);
        timings.current = { shown: 0, firstMove: null };

        // Random Selection
        const randomScenario = SCENARIO_PROMPTS[Math.floor(Math.random() * SCENARIO_PROMPTS.length)];
        const randomQuestion = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
        const randomVariant = SENTENCE_VARIANTS[Math.floor(Math.random() * SENTENCE_VARIANTS.length)];

        // Random Empathy Choice (pre-select)
        const randomEmpathy = EMPATHY_PROMPTS[Math.floor(Math.random() * EMPATHY_PROMPTS.length)];
        // Wait to show it though

        setScenarioText(randomScenario);
        setQuestionText(randomQuestion);
        setVariant(randomVariant);

        // Shuffle fragments
        const shuffled = [...randomVariant.fragments].sort(() => Math.random() - 0.5);
        setItems(shuffled);

        setTimeout(() => setStage('scenario'), 500);
    };

    // Transition to Builder & Freeze Detection
    useEffect(() => {
        if (stage === 'scenario') {
            const timer = setTimeout(() => {
                setStage('builder');
                timings.current.shown = Date.now();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [stage]);

    // Freeze Detection Timer
    useEffect(() => {
        if (stage === 'builder' && !hasInteracted) {
            const timer = setTimeout(() => {
                const randomEmpathy = EMPATHY_PROMPTS[Math.floor(Math.random() * EMPATHY_PROMPTS.length)];
                setEmpathyMessage(randomEmpathy);
            }, 5000); // 5s freeze
            return () => clearTimeout(timer);
        }
    }, [stage, hasInteracted]);


    // Track First Move
    const handleReorder = (newOrder: string[]) => {
        if (!hasInteracted) {
            setHasInteracted(true);
            setEmpathyMessage(null); // Clear empathy message on first move
        }
        if (timings.current.firstMove === null) {
            timings.current.firstMove = Date.now();
        }
        setItems(newOrder);
    };

    // Evaluation Logic
    const analyzeResponse = () => {
        if (!variant) return;

        setStage('analyzing');

        // Calculate Hesitation
        const hesitationTime = timings.current.firstMove
            ? timings.current.firstMove - timings.current.shown
            : 0;

        // hesitationTime is in ms. 
        if (hesitationTime < 2000) {
            setHesitationPreamble("You’re willing to start quickly — we can help you shape that flow.");
        } else if (hesitationTime > 6000) {
            setHesitationPreamble("You’re careful before you speak — that’s not a flaw.");
        } else {
            setHesitationPreamble(null);
        }

        const userRoles = items.map(text => variant.roleMap[text]);
        const firstRole = userRoles[0];

        const startsWell = firstRole === 'BUFFER' || firstRole === 'STANCE';
        const highCognitiveLoad = firstRole === 'EVENT' || firstRole === 'CAUSE';

        let calculatedPattern: PatternType = 'CAREFUL_CONSTRUCTOR';

        // High load + slow start = translation/heavy processing
        if (highCognitiveLoad && hesitationTime > 2500) {
            calculatedPattern = 'TRANSLATION_FIRST';
        } else if (startsWell) {
            // Check exact order match
            const userString = items.map(s => s.trim()).join(' ');
            const idealString = variant.fullSentence.replace(/\s+/g, ' ').trim();
            const cleanUserString = userString.replace(/\s+/g, ' ').trim();

            if (cleanUserString === idealString) {
                calculatedPattern = 'FLOW_ORIENTED';
            } else {
                calculatedPattern = 'NATURAL_BUT_UNSTRUCTURED';
            }
        } else {
            calculatedPattern = 'CAREFUL_CONSTRUCTOR';
        }

        setTimeout(() => {
            setPattern(calculatedPattern);
            setStage('feedback');
        }, 1500);
    };

    return (
        <section className="py-32 bg-background text-foreground relative min-h-[800px] flex flex-col justify-center items-center overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric/5 rounded-full blur-[100px] pointer-events-none" />

            {/* STAGE: IDLE / LOADING */}
            {stage === 'idle' && (
                <Loader2 className="animate-spin text-muted-foreground" />
            )}

            {/* STAGE: SCENARIO */}
            <AnimatePresence mode="wait">
                {stage === 'scenario' && (
                    <motion.div
                        key="scenario"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center max-w-2xl px-6"
                    >
                        <p className="text-muted-foreground text-lg uppercase tracking-widest font-medium mb-8">
                            {scenarioText}
                        </p>
                        <h2 className="font-serif text-3xl md:text-5xl italic leading-tight text-foreground">
                            "{questionText}"
                        </h2>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STAGE: BUILDER */}
            <AnimatePresence mode="wait">
                {stage === 'builder' && (
                    <motion.div
                        key="builder"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-3xl px-6 flex flex-col items-center"
                    >
                        <div className="mb-8 text-center min-h-[80px]">
                            {/* PRE-FAILURE NORMALIZATION & FREEZE EMPATHY */}
                            <AnimatePresence mode="wait">
                                {!hasInteracted && !empathyMessage && (
                                    <motion.p
                                        key="norm"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="text-muted-foreground font-medium"
                                    >
                                        Take your time — there’s no perfect order here.
                                    </motion.p>
                                )}
                                {!hasInteracted && empathyMessage && (
                                    <motion.p
                                        key="empathy"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="text-electric font-medium italic"
                                    >
                                        {empathyMessage}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            <p className="font-serif text-2xl italic opacity-70 mt-4">"{questionText}"</p>
                        </div>

                        <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="w-full space-y-3 mb-12">
                            {items.map((item) => (
                                <Reorder.Item
                                    key={item}
                                    value={item}
                                    whileHover={{ scale: 1.02 }}
                                    whileDrag={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }} // Tactile, calm
                                    className="bg-card border border-border p-6 rounded-xl shadow-sm cursor-grab active:cursor-grabbing text-lg md:text-xl font-medium text-foreground select-none flex items-center justify-between group"
                                >
                                    {item}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                                        ⋮⋮
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>

                        <Button
                            onClick={analyzeResponse}
                            size="lg"
                            className="bg-electric hover:bg-electric/90 text-white rounded-full px-12 h-14 text-lg shadow-lg shadow-electric/20"
                        >
                            See reflection
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STAGE: ANALYZING */}
            {stage === 'analyzing' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center p-12"
                >
                    <div className="relative w-20 h-20 mb-6">
                        <motion.div
                            className="absolute inset-0 border-4 border-electric/20 rounded-full"
                        />
                        <motion.div
                            className="absolute inset-0 border-t-4 border-electric rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                        />
                    </div>
                    <p className="text-muted-foreground font-medium animate-pulse">Reflecting on your strategy...</p>
                </motion.div>
            )}

            {/* STAGE: FEEDBACK */}
            <AnimatePresence mode="wait">
                {stage === 'feedback' && pattern && (
                    <motion.div
                        key="feedback"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl px-6 w-full"
                    >
                        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl relative">
                            {/* Header Gradient */}
                            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-electric to-academic-gold" />

                            <div className="p-8 md:p-12 space-y-8">
                                <div>
                                    <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase opacity-70">
                                        Your Pattern
                                    </span>
                                    <h2 className="font-serif text-3xl md:text-4xl mt-2 text-foreground">
                                        {FEEDBACK_DATA[pattern].title}
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    {/* HESITATION AWARE PREAMBLE */}
                                    {hesitationPreamble && (
                                        <div className="bg-muted/20 p-4 rounded-xl border border-border/50 italic text-muted-foreground">
                                            {hesitationPreamble}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <h4 className="font-bold text-sm uppercase tracking-wide text-foreground/80">Observation</h4>
                                        <p className="text-muted-foreground text-lg leading-relaxed">
                                            {FEEDBACK_DATA[pattern].explanation}
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 pt-4">
                                        <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                                            <h4 className="font-bold text-sm uppercase tracking-wide text-muted-foreground/80 mb-2">The Pressure</h4>
                                            <p className="text-muted-foreground text-sm">
                                                {FEEDBACK_DATA[pattern].difficulty}
                                            </p>
                                        </div>
                                        <div className="bg-electric/5 p-6 rounded-2xl border border-electric/10">
                                            <h4 className="font-bold text-sm uppercase tracking-wide text-electric mb-2">Fluent Strategy</h4>
                                            <p className="text-foreground/80 text-sm">
                                                {FEEDBACK_DATA[pattern].fluentStrategy}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border mt-4">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-academic-gold/20 p-3 rounded-full text-academic-gold mt-1">
                                                <Sparkles size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground mb-1">Actionable Takeaway</h4>
                                                <p className="text-muted-foreground italic">
                                                    "{FEEDBACK_DATA[pattern].takeaway}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DECOMPRESSION LANDING */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="text-center mt-12 space-y-8"
                        >
                            <h3 className="font-serif text-2xl md:text-3xl text-foreground/90 italic">
                                "Nothing is wrong with your English.<br className="hidden md:block" />
                                You’re just trying to speak too late."
                            </h3>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link href="/sign-up">
                                    <Button size="lg" className="h-14 px-8 rounded-full bg-electric hover:bg-electric/90 text-white text-base font-medium shadow-xl hover:scale-105 transition-all w-full sm:w-auto">
                                        Continue with a real session
                                    </Button>
                                </Link>

                                <Button
                                    onClick={startNewSession}
                                    variant="outline"
                                    className="h-14 px-8 rounded-full border-border text-foreground hover:bg-muted/30 text-base font-medium w-full sm:w-auto"
                                >
                                    <RefreshCcw size={14} className="mr-2" /> Try another example
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">Save your speaking pattern and practice live.</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
