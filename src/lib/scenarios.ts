export type ScenarioSlug =
  | "meeting-confidence"
  | "clear-expression"
  | "pressure-confidence"
  | "professional-english";

export interface SpeakingScenario {
  slug: ScenarioSlug;
  emoji: string;
  cardTitle: string;
  cardSubtitle: string;
  miniHero: string;
  weekThemes: [string, string, string, string];
  outcomes: string[];
  pageHeroTitle: string;
  pageHeroSubtitle: string;
  painPoints: string[];
  weekDetails: {
    title: string;
    summary: string;
  }[];
  pageOutcomes: string[];
}

export const SCENARIOS: Record<ScenarioSlug, SpeakingScenario> = {
  "meeting-confidence": {
    slug: "meeting-confidence",
    emoji: "🗣️",
    cardTitle: "I freeze in meetings",
    cardSubtitle: "I hesitate, overthink, or stay silent when I should speak.",
    miniHero: "Speak confidently in meetings without freezing or overthinking.",
    weekThemes: [
      "Week 1: Start speaking faster",
      "Week 2: Hold the floor calmly",
      "Week 3: Join fast moving discussions",
      "Week 4: Lead parts of the meeting",
    ],
    outcomes: [
      "You can enter a discussion with one or two reliable starter phrases.",
      "You can share a point in 3 clear sentences without losing your thread.",
      "You stop replaying meetings in your head and move on quickly.",
    ],
    pageHeroTitle: "30-Day Meeting Confidence Plan",
    pageHeroSubtitle:
      "Stop freezing when it’s your turn. Build automatic phrases and speaking reflexes for real meetings.",
    painPoints: [
      "You stay quiet even when you have something useful to say.",
      "By the time you form the sentence in your head, the topic has already moved.",
      "You replay meetings afterwards and think, “I should have said this…”",
      "You worry that your silence makes you look less competent or engaged.",
      "You speak well one to one, but group calls feel like a different language.",
    ],
    weekDetails: [
      {
        title: "Week 1: Safe Entry Phrases",
        summary:
          "Build five to seven automatic openings you can use in any meeting so you never start from silence.",
      },
      {
        title: "Week 2: Short, Strong Contributions",
        summary:
          "Practice three sentence patterns to share updates, opinions, and clarifications without rambling.",
      },
      {
        title: "Week 3: Joining Fast Conversations",
        summary:
          "Train simple cut in phrases and timing so you can enter ongoing discussions without feeling rude.",
      },
      {
        title: "Week 4: Leading Micro Moments",
        summary:
          "Host small parts of meetings, such as short check ins and summaries, to lock in your new confidence.",
      },
    ],
    pageOutcomes: [
      "You speak up in most meetings at least once without forcing yourself.",
      "You have a toolbox of reliable entry phrases for different situations.",
      "You feel calm enough to listen, think, and contribute — not just survive.",
    ],
  },
  "clear-expression": {
    slug: "clear-expression",
    emoji: "💭",
    cardTitle: "My ideas come out messy",
    cardSubtitle: "I know what I want to say but lose structure.",
    miniHero: "Express complex ideas clearly without losing your sentence halfway.",
    weekThemes: [
      "Week 1: Speak in clean blocks",
      "Week 2: Explain ideas step by step",
      "Week 3: Handle follow up questions",
      "Week 4: Think and speak at the same time",
    ],
    outcomes: [
      "You can explain your point in 30 to 60 seconds without getting lost.",
      "You use simple signposting language to organize your ideas.",
      "You feel your English supports your thinking instead of blocking it.",
    ],
    pageHeroTitle: "30-Day Clear Expression Plan",
    pageHeroSubtitle:
      "Turn scattered thoughts into structured English even when you are speaking live.",
    painPoints: [
      "You start a sentence and realize halfway you don’t know how to finish.",
      "You often say, “Wait, let me start again,” when explaining ideas.",
      "People ask you to repeat or clarify, even though your idea was good.",
      "You feel your English makes you sound less intelligent than you are.",
      "Writing is okay, but speaking is where everything feels messy and slow.",
    ],
    weekDetails: [
      {
        title: "Week 1: Three Sentence Blocks",
        summary:
          "Learn simple three sentence patterns with clear context, point, and example for everyday explanations.",
      },
      {
        title: "Week 2: Explain Work Clearly",
        summary:
          "Practice explaining tasks, progress, and decisions with predictable structures.",
      },
      {
        title: "Week 3: Handle Questions",
        summary:
          "Use “bridge phrases” to buy time, clarify questions, and answer without panic.",
      },
      {
        title: "Week 4: Live Thinking Drills",
        summary:
          "Train quick-thinking drills so your English keeps up with your ideas in real time.",
      },
    ],
    pageOutcomes: [
      "You can explain what you mean in one clear attempt, not three.",
      "You use simple structure phrases like saying that there are three reasons automatically.",
      "You feel comfortable being asked to “walk us through your thinking.”",
    ],
  },
  "pressure-confidence": {
    slug: "pressure-confidence",
    emoji: "😰",
    cardTitle: "I panic under pressure",
    cardSubtitle: "Senior calls, presentations, and spot questions shake me.",
    miniHero: "Stay steady under pressure even with seniors and tough questions.",
    weekThemes: [
      "Week 1: Calm your openings",
      "Week 2: Handle visibility moments",
      "Week 3: Survive tough questions",
      "Week 4: Project senior confidence",
    ],
    outcomes: [
      "You know exactly how to start speaking even when everyone is watching.",
      "You have backup phrases ready for when your mind goes blank.",
      "Your body (pace, breathing, tone) signals calm instead of panic.",
    ],
    pageHeroTitle: "30 Day Pressure Confidence Plan",
    pageHeroSubtitle:
      "Train your nervous system and your language so high stakes English stops feeling dangerous.",
    painPoints: [
      "Your mind goes blank when your name is called in big meetings.",
      "Your heart races and your voice changes when seniors join the call.",
      "You avoid speaking roles because you are afraid of messing up live.",
      "You over prepare slides and scripts but still feel shaky when speaking.",
      "You feel your English is fine in low pressure chats but collapses in real moments.",
    ],
    weekDetails: [
      {
        title: "Week 1: Nervous System Reset",
        summary:
          "Short breathing and warm up routines before English events to stop panic spikes.",
      },
      {
        title: "Week 2: Spotlight Moments",
        summary:
          "Practice intros, updates, and transitions so visibility feels practiced, not random.",
      },
      {
        title: "Week 3: Tough Question Lab",
        summary:
          "Drill a library of phrases for buying time, reframing, and answering difficult questions.",
      },
      {
        title: "Week 4: Executive Presence",
        summary:
          "Work on pacing, pausing, and emphasis so you sound calm and in control.",
      },
    ],
    pageOutcomes: [
      "You can stay present and think even when everyone is looking at you.",
      "You have go to phrases when you do not know the answer immediately.",
      "You feel more excited than afraid when big opportunities appear.",
    ],
  },
  "professional-english": {
    slug: "professional-english",
    emoji: "💼",
    cardTitle: "I don't sound professional",
    cardSubtitle: "My English feels too casual or informal for work.",
    miniHero: "Sound polished and professional without sounding fake or robotic.",
    weekThemes: [
      "Week 1: Clean up casual habits",
      "Week 2: Professional vocabulary in context",
      "Week 3: Email and meeting polish",
      "Week 4: Consistent professional tone",
    ],
    outcomes: [
      "You stop worrying that you sound “too casual” in serious situations.",
      "You use natural professional phrases instead of translating from your first language.",
      "Your emails, updates, and calls feel aligned with your seniority.",
    ],
    pageHeroTitle: "30 Day Professional English Plan",
    pageHeroSubtitle:
      "Upgrade your tone, vocabulary, and structure so your English matches your role.",
    painPoints: [
      "You sometimes feel your English sounds childish or too simple at work.",
      "You copy phrases from native speakers but feel they do not suit you.",
      "You worry that small mistakes make you sound less professional.",
      "You avoid speaking up because you are not sure how to say it in the right way.",
      "You want to sound confident and warm, not stiff or textbook formal.",
    ],
    weekDetails: [
      {
        title: "Week 1: Tone Audit",
        summary:
          "Identify casual fillers and habits, then replace them with clean, neutral alternatives.",
      },
      {
        title: "Week 2: Useful Work Phrases",
        summary:
          "Collect and practice real phrases for alignment, disagreement, and follow‑ups.",
      },
      {
        title: "Week 3: Email and Update Polish",
        summary:
          "Tighten your written tone, then mirror this language in your spoken updates.",
      },
      {
        title: "Week 4: Consistent Professional Voice",
        summary:
          "Integrate your new tone into meetings, 1:1s, and async updates so it feels natural.",
      },
    ],
    pageOutcomes: [
      "You sound like the professional you already are in English too.",
      "You feel proud of how you come across in calls, emails, and presentations.",
      "You stop over apologizing for your English and focus on your ideas.",
    ],
  },
};

export const scenarioList: SpeakingScenario[] = Object.values(SCENARIOS);

export function getScenarioBySlug(slug: string): SpeakingScenario | undefined {
  return SCENARIOS[slug as ScenarioSlug];
}

