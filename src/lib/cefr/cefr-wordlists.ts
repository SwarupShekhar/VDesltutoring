/**
 * CEFR Word Lists and Linguistic Sophistication Data
 * 
 * Used for Language Maturity analysis in the Performance Intelligence Engine.
 */

// ============================================================================
// CEFR LEXICAL TIERS (Simplified)
// ============================================================================

export const CEFR_WORDLISTS: Record<string, string[]> = {
    A1: [
        'hello', 'yes', 'no', 'please', 'thank', 'you', 'i', 'am', 'is', 'are',
        'good', 'bad', 'big', 'small', 'hot', 'cold', 'one', 'two', 'three',
        'go', 'come', 'see', 'want', 'like', 'have', 'get', 'make', 'do',
        'man', 'woman', 'child', 'day', 'time', 'year', 'way', 'thing',
        'house', 'car', 'food', 'water', 'book', 'name', 'work', 'school'
    ],
    A2: [
        'because', 'but', 'when', 'where', 'why', 'how', 'very', 'much', 'many',
        'important', 'different', 'difficult', 'early', 'late', 'young', 'old',
        'possible', 'useful', 'beautiful', 'happy', 'sad', 'angry', 'tired',
        'remember', 'forget', 'think', 'know', 'understand', 'believe', 'hope',
        'week', 'month', 'morning', 'evening', 'yesterday', 'tomorrow',
        'family', 'friend', 'job', 'money', 'country', 'city', 'problem'
    ],
    B1: [
        'although', 'however', 'therefore', 'actually', 'especially', 'particularly',
        'significant', 'relevant', 'appropriate', 'considerable', 'sufficient',
        'determine', 'establish', 'require', 'achieve', 'develop', 'improve',
        'suggest', 'indicate', 'demonstrate', 'investigate', 'analyze',
        'situation', 'environment', 'experience', 'opportunity', 'advantage',
        'disadvantage', 'consequence', 'benefit', 'challenge', 'solution'
    ],
    B2: [
        'nevertheless', 'furthermore', 'moreover', 'consequently', 'subsequently',
        'comprehensive', 'substantial', 'sophisticated', 'inevitable', 'crucial',
        'fundamental', 'potential', 'significant', 'evident', 'apparent',
        'implement', 'facilitate', 'enhance', 'contribute', 'undertake',
        'constitute', 'demonstrate', 'evaluate', 'assess', 'identify',
        'perspective', 'phenomenon', 'framework', 'criterion', 'mechanism',
        'dimension', 'assumption', 'implication', 'context', 'strategy'
    ],
    C1: [
        'notwithstanding', 'albeit', 'whereby', 'henceforth', 'heretofore',
        'paradigm', 'intrinsic', 'inherent', 'compelling', 'pervasive',
        'nuanced', 'multifaceted', 'ubiquitous', 'quintessential', 'empirical',
        'substantiate', 'corroborate', 'elucidate', 'extrapolate', 'juxtapose',
        'ascertain', 'discern', 'epitomize', 'exemplify', 'underscore',
        'trajectory', 'dichotomy', 'synthesis', 'correlation', 'rationale',
        'methodology', 'juxtaposition', 'ramification', 'catalyst', 'inception'
    ],
    C2: [
        'recondite', 'abstruse', 'esoteric', 'ephemeral', 'ubiquity',
        'multitudinous', 'perspicacious', 'sagacious', 'erudite', 'verisimilitude',
        'obfuscate', 'promulgate', 'ameliorate', 'exacerbate', 'mitigate',
        'proselytize', 'extrapolate', 'interpolate', 'substantiate', 'postulate',
        'zeitgeist', 'raison', 'detre', 'sine', 'qua', 'non',
        'epistemology', 'ontology', 'teleology', 'phenomenology', 'dialectic'
    ]
};

// ============================================================================
// VERB SOPHISTICATION MAPPING
// ============================================================================

export const VERB_SOPHISTICATION: Record<string, number> = {
    // Basic verbs (1 point)
    'get': 1,
    'go': 1,
    'come': 1,
    'put': 1,
    'take': 1,
    'make': 1,
    'do': 1,
    'have': 1,
    'be': 1,
    'give': 1,
    'say': 1,
    'tell': 1,
    'see': 1,
    'know': 1,
    'want': 1,
    'use': 1,
    'find': 1,
    'think': 1,
    'look': 1,
    'work': 1,

    // Intermediate verbs (3 points)
    'obtain': 3,
    'acquire': 3,
    'receive': 3,
    'provide': 3,
    'deliver': 3,
    'perform': 3,
    'execute': 3,
    'conduct': 3,
    'demonstrate': 3,
    'indicate': 3,
    'suggest': 3,
    'recommend': 3,
    'propose': 3,
    'consider': 3,
    'examine': 3,
    'analyze': 3,
    'evaluate': 3,
    'assess': 3,
    'determine': 3,
    'establish': 3,

    // Advanced verbs (5 points)
    'facilitate': 5,
    'implement': 5,
    'consolidate': 5,
    'substantiate': 5,
    'corroborate': 5,
    'elucidate': 5,
    'extrapolate': 5,
    'ascertain': 5,
    'discern': 5,
    'epitomize': 5,
    'exemplify': 5,
    'underscore': 5,
    'expedite': 5,
    'optimize': 5,
    'synthesize': 5,
    'articulate': 5,
    'formulate': 5,
    'rationalize': 5,
    'conceptualize': 5,
    'operationalize': 5
};

// ============================================================================
// CONNECTOR COMPLEXITY
// ============================================================================

export const CONNECTORS = [
    // Basic (level 1)
    { phrase: 'and', level: 1 },
    { phrase: 'but', level: 1 },
    { phrase: 'so', level: 1 },
    { phrase: 'because', level: 1 },
    { phrase: 'when', level: 1 },
    { phrase: 'if', level: 1 },

    // Intermediate (level 3)
    { phrase: 'however', level: 3 },
    { phrase: 'therefore', level: 3 },
    { phrase: 'although', level: 3 },
    { phrase: 'whereas', level: 3 },
    { phrase: 'unless', level: 3 },
    { phrase: 'besides', level: 3 },
    { phrase: 'meanwhile', level: 3 },
    { phrase: 'furthermore', level: 3 },
    { phrase: 'moreover', level: 3 },
    { phrase: 'in addition', level: 3 },

    // Advanced (level 5)
    { phrase: 'nevertheless', level: 5 },
    { phrase: 'nonetheless', level: 5 },
    { phrase: 'consequently', level: 5 },
    { phrase: 'subsequently', level: 5 },
    { phrase: 'notwithstanding', level: 5 },
    { phrase: 'albeit', level: 5 },
    { phrase: 'whereby', level: 5 },
    { phrase: 'insofar as', level: 5 },
    { phrase: 'inasmuch as', level: 5 },
    { phrase: 'by the same token', level: 5 }
];
