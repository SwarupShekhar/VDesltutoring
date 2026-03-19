# Englivo Architecture Documentation

## Overview

Englivo is a comprehensive AI-powered English fluency training platform designed for professionals. The application enables learners to improve their English speaking skills through real-time practice sessions, AI tutoring, live coaching, and CEFR-based progress tracking.

---

## 1. Technology Stack

### 1.1 Frontend

| Technology    | Version  | Purpose                          |
| ------------- | -------- | -------------------------------- |
| Next.js       | 16.0.10  | React framework with App Router  |
| React         | 19.2.1   | UI library                       |
| Tailwind CSS  | 4        | Utility-first CSS framework      |
| Framer Motion | 12.23.26 | Animation library                |
| Radix UI      | -        | Unstyled UI component primitives |
| Lucide React  | 0.562.0  | Icon library                     |
| Recharts      | 3.6.0    | Charting library                 |
| TipTap        | 3.15.3   | Rich text editor                 |

### 1.2 Backend

| Technology    | Version | Purpose            |
| ------------- | ------- | ------------------ |
| Node.js       | -       | JavaScript runtime |
| Prisma        | 7.3.0   | Database ORM       |
| PostgreSQL    | -       | Primary database   |
| Upstash Redis | 1.37.0  | Caching layer      |
| Clerk         | 6.36.4  | Authentication     |
| Zod           | 3.23.0  | Schema validation  |

### 1.3 AI & Speech Services

| Service       | SDK Version | Purpose                        |
| ------------- | ----------- | ------------------------------ |
| Deepgram      | 4.11.3      | Speech-to-text                 |
| ElevenLabs    | 2.28.0      | Text-to-speech                 |
| OpenAI        | 6.15.0      | GPT-4o for chat & analysis     |
| Google Gemini | 0.24.1      | AI content generation          |
| LiveKit       | 0.13.23     | WebRTC real-time communication |

### 1.4 Infrastructure

| Service          | Purpose             |
| ---------------- | ------------------- |
| Vercel           | Deployment platform |
| Vercel Blob      | File storage        |
| Vercel Analytics | Analytics           |

---

## 2. High-Level Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   Web Application   │  │   PWA / Mobile UI   │  │   Clerk Auth UI    │ │
│  │   (Next.js Pages)   │  │   (Responsive)      │  │   (Authentication)│ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS APP ROUTER                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Route Groups: [locale]/(marketing) | (learner) | (practice-mode)    │   │
│  │  ├── Server Components (RSC) for data fetching                        │   │
│  │  ├── Client Components for interactivity                              │   │
│  │  ├── API Routes (/api/*) for backend logic                           │   │
│  │  └── Server Actions for mutations                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BUSINESS LOGIC LAYER                                │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                           MODULES                                     │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │   │
│  │  │  aiTutor   │ │  practice  │ │  sessions │ │ dashboard │        │   │
│  │  │  Module    │ │   Module   │ │   Module   │ │   Module  │        │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘        │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │   │
│  │  │   admin    │ │  analytics │ │    qa     │ │   tutor   │        │   │
│  │  │   Module   │ │   Module   │ │   Module   │ │   Module  │        │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                           ENGINES                                     │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │   │
│  │  │  Fluency Engine │  │   CEFR Engine   │  │  Coaching Engine│       │   │
│  │  │                 │  │                 │  │                 │       │   │
│  │  │ - Audio         │  │ - Level         │  │ - Daily Missions│       │   │
│  │  │   Confidence    │  │   Assessment    │  │ - Micro Lessons │       │   │
│  │  │ - Hesitation    │  │ - Promotion     │  │ - Adaptive      │       │   │
│  │  │   Detection     │  │   Gates         │  │   Difficulty    │       │   │
│  │  │ - Fluency       │  │ - Lexical       │  │ - Skill Progress│       │   │
│  │  │   Scoring      │  │   Tracking      │  │                 │       │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES LAYER                             │
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                  │
│  │   LiveKit     │  │   Deepgram    │  │ ElevenLabs   │                  │
│  │  (WebRTC)     │  │    (STT)      │  │   (TTS)       │                  │
│  │               │  │               │  │               │                  │
│  │ - Video/Audio │  │ - Real-time   │  │ - Speech      │                  │
│  │   Sessions    │  │   Transcription│  │   Synthesis   │                  │
│  │ - Room Mgmt  │  │ - Word-level   │  │ - Voice Clones│                  │
│  │ - Token Gen  │  │   Timestamps   │  │               │                  │
│  └───────────────┘  └───────────────┘  └───────────────┘                  │
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐                                     │
│  │   OpenAI      │  │    Gemini     │                                     │
│  │   (GPT-4o)    │  │               │                                     │
│  │               │  │               │                                     │
│  │ - Chat        │  │ - Content     │                                     │
│  │   Responses   │  │   Generation  │                                     │
│  │ - JSON Reports│  │ - Analysis    │                                     │
│  │ - Feedback    │  │               │                                     │
│  └───────────────┘  └───────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                       │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │  PostgreSQL    │  │     Redis       │  │  Vercel Blob   │              │
│  │  (Prisma ORM)  │  │   (Upstash)    │  │   (Storage)    │              │
│  │                │  │                │  │                │              │
│  │ - Users        │  │ - Session      │  │ - Audio Files  │              │
│  │ - Sessions     │  │   State Cache  │  │ - Images       │              │
│  │ - Transcripts │  │ - API Response │  │ - Media        │              │
│  │ - Profiles     │  │   Cache        │  │                │              │
│  │ - Metrics      │  │ - Rate Limits  │  │                │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Project Structure

### 3.1 Directory Overview

```
esltutoring/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── [locale]/                  # Dynamic locale parameter
│   │   │   ├── (marketing)/          # Marketing route group
│   │   │   │   ├── page.tsx          # Homepage
│   │   │   │   ├── about/
│   │   │   │   ├── blog/
│   │   │   │   ├── pricing/
│   │   │   │   ├── how-it-works/
│   │   │   │   ├── method/
│   │   │   │   ├── privacy/
│   │   │   │   ├── terms/
│   │   │   │   ├── sessions/
│   │   │   │   ├── fluency-guide/
│   │   │   │   └── roadmap/
│   │   │   │
│   │   │   ├── (learner)/            # Learner route group
│   │   │   │   ├── dashboard/       # User dashboard
│   │   │   │   ├── sessions/        # Session management
│   │   │   │   └── history/          # Session history
│   │   │   │
│   │   │   ├── (practice-mode)/      # Practice mode route group
│   │   │   │   └── practice/        # AI practice interface
│   │   │   │
│   │   │   └── admin/                # Admin route group
│   │   │       ├── dashboard/
│   │   │       ├── students/
│   │   │       └── blog/
│   │   │
│   │   ├── (admin)/                  # Admin-specific layouts
│   │   │   └── admin/
│   │   │       ├── analytics/
│   │   │       ├── control/
│   │   │       └── qa/
│   │   │
│   │   ├── api/                      # API routes
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   ├── sitemap.ts                # Sitemap generation
│   │   └── robots.ts                 # Robots.txt
│   │
│   ├── components/                    # Reusable UI components
│   │   ├── SpeakNaturallySection.tsx
│   │   ├── PricingPageContent.tsx
│   │   ├── SituationalGateway.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── BrowserExtensionFix.tsx
│   │   └── [many more...]
│   │
│   ├── modules/                       # Feature modules
│   │   ├── aiTutor/
│   │   │   ├── index.ts
│   │   │   ├── logic.ts              # AI tutor business logic
│   │   │   └── types.ts
│   │   ├── practice/
│   │   │   ├── index.ts
│   │   │   ├── logic.ts              # Practice session logic
│   │   │   ├── api.ts
│   │   │   └── types.ts
│   │   ├── sessions/
│   │   ├── dashboard/
│   │   ├── admin/
│   │   ├── analytics/
│   │   ├── qa/
│   │   └── tutor/
│   │
│   ├── engines/                       # Core processing engines
│   │   ├── fluency/
│   │   │   ├── fluencyEngine.ts     # Main fluency processing
│   │   │   ├── fluencyScore.ts      # Scoring algorithms
│   │   │   ├── fluencyTrainer.ts    # Training logic
│   │   │   └── index.ts
│   │   ├── cefr/
│   │   │   ├── cefrEngine.ts        # CEFR level assessment
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── coaching/
│   │       ├── adaptiveDifficulty.ts
│   │       ├── dailyMission.ts
│   │       ├── englivoLessons.ts
│   │       ├── microLessons.ts
│   │       ├── microLessonSelector.ts
│   │       ├── skillProgress.ts
│   │       └── index.ts
│   │
│   ├── services/                      # External service integrations
│   │   ├── livekit.ts                # Video session service
│   │   ├── openai.ts                # OpenAI GPT integration
│   │   ├── gemini.ts                # Google Gemini integration
│   │   └── index.ts
│   │
│   ├── lib/                           # Utility libraries
│   │   ├── prisma.ts                # Prisma client singleton
│   │   ├── speech/
│   │   │   ├── audioConfidenceAnalyzer.ts  # Audio analysis
│   │   │   └── detectNonEnglish.ts         # Language detection
│   │   ├── assessment/
│   │   │   ├── constants.ts
│   │   │   └── updateUserFluencyProfile.ts
│   │   ├── cefr/
│   │   │   ├── aggregateUserSpeechMetrics.ts
│   │   │   ├── cefr-wordlists.ts
│   │   │   ├── cefrPromotionConfig.ts
│   │   │   ├── evaluateCEFRPromotion.ts
│   │   │   └── index.ts
│   │   ├── audit-logger.ts
│   │   ├── idempotency.ts
│   │   ├── session-state-machine.ts
│   │   ├── fluencyScore.ts
│   │   ├── fluency-engine.ts
│   │   ├── practice-questions.ts
│   │   ├── scenarios.ts
│   │   ├── cefr-helpers.ts
│   │   ├── cefr-lexical-triggers.ts
│   │   └── [many more...]
│   │
│   ├── i18n/                         # Internationalization
│   │   ├── getDictionary.ts
│   │   ├── en.json                   # English (44,567 chars)
│   │   ├── de.json                   # German
│   │   ├── fr.json                   # French
│   │   ├── es.json                   # Spanish
│   │   ├── vi.json                   # Vietnamese
│   │   └── ja.json                   # Japanese
│   │
│   ├── routes/                        # Route handlers
│   ├── schemas/                       # Zod validation schemas
│   ├── middlewares/                   # Request middleware
│   ├── actions/                       # Server actions
│   ├── types/                         # TypeScript types
│   ├── data/                          # Static data
│   └── proxy.ts                       # API proxy configuration
│
├── prisma/
│   ├── schema.prisma                  # Database schema (389 lines)
│   ├── seed.ts                        # Database seeder
│   └── migrations/                    # Migration files
│
├── public/                            # Static assets
│   ├── icons/
│   ├── audio/
│   └── [assets...]
│
├── scripts/                           # Utility scripts
│   ├── seed-drills.ts
│   ├── check-db-state.ts
│   ├── sync-clerk-users.ts
│   └── [many more...]
│
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 4. Data Models

### 4.1 Database Schema Overview

The database schema is defined in [`prisma/schema.prisma`](prisma/schema.prisma) with 389 lines and 15+ models.

#### Core Entities

| Model                  | Description           | Key Fields                                                                                               |
| ---------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| `users`                | Base user entity      | clerkId, email, full_name, role (ADMIN/TUTOR/LEARNER), profile_image_url, coach_memory                   |
| `student_profiles`     | Learner data          | user_id, credits, learning_goals, primary_tutor_id                                                       |
| `tutor_profiles`       | Tutor data            | user_id, bio, expertise_tags, hourly_rate_equivalent                                                     |
| `tutor_availability`   | Schedule              | tutor_id, day_of_week, start_time, end_time                                                              |
| `sessions`             | Scheduled sessions    | student_id, tutor_id, start_time, end_time, status, livekit_room_id                                      |
| `live_sessions`        | Real-time sessions    | room_name, user_a, user_b, status (waiting/live/ended), metrics                                          |
| `live_transcripts`     | Session transcripts   | session_id, user_id, text, timestamp, word_data (JSON)                                                   |
| `live_metrics`         | Real-time metrics     | session_id, user_id, speaking_time, word_count, hesitation_count, filler_count                           |
| `live_session_summary` | Post-session analysis | session_id, user_id, confidence_score, fluency_score, drill_plan, weaknesses, ai_feedback                |
| `live_weaknesses`      | Weakness tracking     | session_id, user_id, tag, severity                                                                       |
| `live_micro_fixes`     | Targeted fixes        | session_id, user_id, category, detected_words, upgrades, explanation                                     |
| `live_queue`           | Peer matching queue   | user_id, fluency_score, goal, joined_at                                                                  |
| `fluency_sessions`     | AI practice records   | user_clerk_id, average_score, rounds                                                                     |
| `fluency_snapshots`    | Practice metrics      | user_id, hesitation, pronunciation, fillers, grammar_scaffold, translation_thinking, language_confidence |
| `user_fluency_profile` | CEFR profile          | user_id, cefr_level, fluency_score, confidence, pause_ratio, speech_rate_variance, lexical_blockers      |
| `ai_chat_sessions`     | AI tutor chats        | user_id, fluency_score, grammar_score, vocabulary_score, feedback_summary                                |
| `ai_chat_messages`     | Chat messages         | session_id, role, content, timestamp                                                                     |
| `packages`             | Credit packages       | name, price_usd, credit_amount, is_public                                                                |
| `notifications`        | User notifications    | user_id, title, message, is_read                                                                         |
| `blog_posts`           | CMS content           | title, slug, content, cover, status, author_id, views                                                    |
| `idempotency_records`  | Request idempotency   | key, operation, user_id, request_data_hash, expires_at                                                   |
| `audit_logs`           | Action audit trail    | user_id, action, event_type, resource_id, details                                                        |
| `fluency_exercises`    | Practice exercises    | weakness_tag, prompt, difficulty                                                                         |
| `user_daily_plan`      | Daily exercises       | user_id, date, exercise_id, status                                                                       |

### 4.2 Key Enums

```prisma
// Session lifecycle status
enum session_status {
  SCHEDULED    // Session booked, waiting for start
  LIVE         // Session in progress
  COMPLETED    // Successfully finished
  CANCELLED    // Cancelled by either party
  NO_SHOW      // Participant didn't show up
}

// User roles in the system
enum user_role {
  ADMIN        // Full system access
  TUTOR        // Can conduct sessions
  LEARNER      // Student user
}

// Live session state
enum live_session_status {
  waiting      // Waiting for participants
  live         // Session active
  ended        // Session completed
}
```

---

## 5. Core Processing Engines

### 5.1 Fluency Engine

The Fluency Engine (`src/engines/fluency/`) analyzes speech patterns to determine a learner's confidence level.

#### Audio Confidence Analysis

Located in [`lib/speech/audioConfidenceAnalyzer.ts`](src/lib/speech/audioConfidenceAnalyzer.ts):

```typescript
interface AudioConfidenceMetrics {
  avgPauseMs: number; // Average pause duration in milliseconds
  midSentencePauseRatio: number; // Ratio of pauses mid-sentence to total words
  pauseVariance: number; // Consistency of pause timing
  speechRateWpm: number; // Words per minute
  speechRateVariance: number; // Speed consistency
  recoveryScore: number; // Ability to recover from pauses smoothly
}

interface ConfidenceResult {
  score: number; // 0-100 confidence score
  band: "Low" | "Medium" | "High";
  explanation: string;
  metrics: AudioConfidenceMetrics;
  hesitationFlags: {
    midPauseHigh: boolean;
    avgPauseHigh: boolean;
    rhythmUnstable: boolean;
  };
}
```

#### Confidence Score Formula

```
ConfidenceScore = 100
  - 35 × MidPauseRatio(scaled)
  - 20 × PauseVariance
  - 20 × SpeechRateVariance
  - 25 × (1 - RecoveryScore)
```

#### Key Metrics

| Metric                  | Description                                         | Healthy Range |
| ----------------------- | --------------------------------------------------- | ------------- |
| `avgPauseMs`            | Average pause between words                         | < 500ms       |
| `midSentencePauseRatio` | Percentage of words preceded by mid-sentence pauses | < 0.15        |
| `pauseVariance`         | Consistency of pause timing                         | < 0.3         |
| `speechRateWpm`         | Words spoken per minute                             | 120-180       |
| `speechRateVariance`    | Speed consistency                                   | < 0.3         |
| `recoveryScore`         | Ability to recover from pauses                      | > 0.6         |

### 5.2 CEFR Engine

The CEFR Engine (`src/engines/cefr/`) evaluates learner progress against the Common European Framework of Reference.

#### CEFR Levels

| Level | Description        | Typical WPM | Vocabulary   |
| ----- | ------------------ | ----------- | ------------ |
| A1    | Beginner           | 60-80       | ~500 words   |
| A2    | Elementary         | 80-100      | ~1000 words  |
| B1    | Intermediate       | 100-120     | ~2000 words  |
| B2    | Upper Intermediate | 120-140     | ~3000 words  |
| C1    | Advanced           | 140-160     | ~5000 words  |
| C2    | Proficient         | 160-180     | ~8000+ words |

#### Promotion Gates

The system implements gate-based promotion - learners must pass multiple criteria before advancing to the next CEFR level:

```typescript
interface CEFROPromotionGates {
  minSessions: number; // Minimum practice sessions
  minFluencyScore: number; // Minimum fluency score
  minConfidenceScore: number; // Minimum confidence score
  maxHesitationRate: number; // Maximum hesitation rate
  minSpeechRate: number; // Minimum words per minute
  vocabularyGate: string[]; // Required vocabulary by level
}
```

### 5.3 Coaching Engine

The Coaching Engine (`src/engines/coaching/`) provides adaptive learning.

#### Components

1. **Daily Missions**: Personalized daily practice goals
2. **Micro Lessons**: Short, focused exercises targeting specific weaknesses
3. **Adaptive Difficulty**: Automatically adjusts based on performance
4. **Skill Progress**: Tracks development across multiple skill areas

---

## 6. API Services Integration

### 6.1 LiveKit Service

Real-time video/audio communication via [`services/livekit.ts`](src/services/livekit.ts):

```typescript
// Generate access token for session participant
generateLiveKitToken({
    roomId: string,        // Session ID used as room name
    userId: string,        // Clerk user ID
    userName: string,     // Display name
    role: 'tutor' | 'student' | 'admin',
    metadata?: Record<string, any>
}): Promise<string>

// Create a new room for session
createLiveKitRoom(sessionId: string): Promise<string>

// Delete room after session ends
deleteLiveKitRoom(roomId: string): Promise<void>

// Validate session access timing
validateSessionAccess({
    sessionId: string,
    userId: string,
    userRole: string,
    sessionStartTime: Date,
    sessionEndTime: Date
}): { valid: boolean; reason?: string }
```

#### Room Configuration

```typescript
const ROOM_CONFIG = {
  emptyTimeout: 5 * 60, // 5 minutes - room auto-deletes
  maxParticipants: 2, // Tutor + Student
  departureTimeout: 30, // 30 seconds departure detection
};
```

### 6.2 OpenAI Service

AI-powered chat and analysis via [`services/openai.ts`](src/services/openai.ts):

```typescript
class OpenAIService {
  // Conversational AI (Fast, uses gpt-4o)
  generateChatResponse(
    systemPrompt: string,
    userMessage: string,
  ): Promise<string>;

  // Structured JSON analysis (Deep, uses gpt-4o)
  generateJsonReport(systemPrompt: string, transcript: string): Promise<any>;
}
```

### 6.3 Deepgram Integration

Speech-to-text processing:

| Feature                 | Description                        |
| ----------------------- | ---------------------------------- |
| Real-time Transcription | Streaming word-level transcription |
| Word Timestamps         | Start/end time for each word       |
| Confidence Scores       | Per-word confidence (0-1)          |
| Punctuation             | Automatic punctuation restoration  |
| Profanity Filter        | Optional content filtering         |

---

## 7. Authentication & Authorization

### 7.1 Clerk Integration

The application uses Clerk (`@clerk/nextjs`) for authentication:

- **Social Login**: Google, GitHub, Apple
- **Email/Password**: Traditional authentication
- **Multi-factor Auth**: Optional 2FA
- **User Metadata**: Role and profile data storage

### 7.2 Role-Based Access Control

| Role      | Permissions                                                        |
| --------- | ------------------------------------------------------------------ |
| `LEARNER` | Access dashboard, practice, book sessions, view history            |
| `TUTOR`   | All learner permissions + conduct sessions, view assigned students |
| `ADMIN`   | Full system access, analytics, user management, content management |

### 7.3 Middleware Protection

Route protection implemented in root layout and Clerk components:

```typescript
// In layout.tsx
<ClerkProvider>
    {/* Routes protected by Clerk */}
</ClerkProvider>
```

---

## 8. Internationalization (i18n)

### 8.1 Supported Locales

| Locale | Language   | Coverage     |
| ------ | ---------- | ------------ |
| en     | English    | 44,567 chars |
| de     | German     | 28,403 chars |
| fr     | French     | 29,101 chars |
| es     | Spanish    | 27,584 chars |
| vi     | Vietnamese | 26,338 chars |
| ja     | Japanese   | 20,629 chars |

### 8.2 Implementation

- Dynamic route parameter: `[locale]`
- Dictionary loading: [`i18n/getDictionary.ts`](src/i18n/getDictionary.ts)
- Locale validation in root layout
- Default locale: English (en)

---

## 9. Performance & Reliability

### 9.1 Caching Strategy

| Cache Type     | Technology    | Use Case                                |
| -------------- | ------------- | --------------------------------------- |
| API Response   | Upstash Redis | Session state, frequently accessed data |
| Database Query | Prisma        | Connection pooling                      |
| Static Pages   | Next.js ISR   | Marketing pages, blog posts             |
| Assets         | Vercel CDN    | Images, fonts, static files             |

### 9.2 Idempotency

Idempotency protection via [`lib/idempotency.ts`](src/lib/idempotency.ts):

```typescript
interface IdempotencyRecord {
  key: string; // Unique operation key
  operation: string; // Operation type
  user_id: string; // User who initiated
  request_data_hash: string; // Hash of request data
  response_data?: JSON; // Cached response
  status_code: number; // Response status
  expires_at: DateTime; // Expiration (24h default)
}
```

### 9.3 Audit Logging

Comprehensive audit trail via [`lib/audit-logger.ts`](src/lib/audit-logger.ts):

```typescript
interface AuditLog {
  id: string;
  user_id?: string;
  user_type?: string;
  action: string; // What happened
  event_type: string; // Category of action
  resource_id?: string; // Affected resource
  resource_type?: string; // Resource type
  details?: JSON; // Additional data
  ip_address?: string;
  user_agent?: string;
  created_at: DateTime;
}
```

---

## 10. API Architecture

### 10.1 API Route Structure

```
/api/
├── clerk/                        # Clerk webhook handlers
├── livekit/                      # LiveKit event handlers
├── blog/                        # Blog CRUD operations
├── sessions/                    # Session management
└── [other endpoint groups...]
```

### 10.2 Server Actions

Located in [`src/actions/`](src/actions/):

- Blog management operations
- Session-related mutations
- User profile updates

### 10.3 Request Flow

```
Client Request
    │
    ▼
┌─────────────────┐
│  Clerk Auth    │ ← Validates session
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Middleware    │ ← Route protection
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ API Route /    │ ← Request handling
│ Server Action  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Business      │ ← Module/Engine logic
│  Logic         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Layer    │ ← Prisma/Redis/Blob
└─────────────────┘
```

---

## 11. Environment Configuration

### 11.1 Required Environment Variables

| Variable                       | Required | Description                  |
| ------------------------------ | -------- | ---------------------------- |
| `DATABASE_URL`                 | Yes      | PostgreSQL connection string |
| `CLERK_SECRET_KEY`             | Yes      | Clerk authentication         |
| `CLERK_PUBLISHABLE_KEY`        | Yes      | Clerk frontend key           |
| `DEEPGRAM_API_KEY`             | Yes      | Speech-to-text               |
| `ELEVENLABS_API_KEY`           | Yes      | Text-to-speech               |
| `OPENAI_API_KEY`               | Yes      | GPT-4o access                |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes      | Gemini access                |
| `LIVEKIT_URL`                  | Yes      | WebRTC server URL            |
| `LIVEKIT_API_KEY`              | Yes      | LiveKit authentication       |
| `LIVEKIT_API_SECRET`           | Yes      | LiveKit authentication       |
| `UPSTASH_REDIS_REST_URL`       | Yes      | Redis caching                |
| `UPSTASH_REDIS_REST_TOKEN`     | Yes      | Redis authentication         |
| `VERCEL_BLOB_READ_WRITE_TOKEN` | Yes      | File storage                 |

### 11.2 Optional Variables

| Variable              | Default               | Description      |
| --------------------- | --------------------- | ---------------- |
| `NODE_ENV`            | development           | Environment mode |
| `NEXT_PUBLIC_APP_URL` | http://localhost:3000 | App URL          |

---

## 12. Development Workflow

### 12.1 Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### 12.2 Build

```bash
# Production build
npm run build

# Start production server
npm start
```

### 12.3 Database Scripts

```bash
# Seed database
npx ts-node prisma/seed.ts

# Check DB state
npx ts-node scripts/check-db-state.ts

# Sync Clerk users
npx ts-node scripts/sync-clerk-users.ts
```

---

## 13. Frontend Architecture

### 13.1 Component Structure

```
src/components/
├── ui/                    # Base UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── [Radix primitives]
├── layout/               # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   └── [navigation]
├── features/             # Feature-specific components
│   ├── practice/
│   ├── sessions/
│   ├── dashboard/
│   └── [by feature]
└── shared/              # Cross-cutting components
    ├── ThemeProvider.tsx
    ├── BrowserExtensionFix.tsx
    └── [utilities]
```

### 13.2 Page Architecture

| Route Group     | Pages                             | Description             |
| --------------- | --------------------------------- | ----------------------- |
| (marketing)     | /, /about, /pricing, /blog, etc.  | Public marketing pages  |
| (learner)       | /dashboard, /sessions, /history   | Protected learner pages |
| (practice-mode) | /practice                         | AI practice interface   |
| admin           | /admin/dashboard, /admin/students | Admin control panel     |

---

## 14. Security Considerations

### 14.1 Authentication Security

- Clerk handles all authentication
- JWT token validation
- Secure session management
- CSRF protection via Clerk

### 14.2 Data Security

- Database connection via Prisma with connection pooling
- Sensitive data encrypted at rest (PostgreSQL)
- API keys stored in environment variables
- No credentials in client-side code

### 14.3 API Security

- Rate limiting via Upstash
- Input validation with Zod schemas
- Idempotency prevents duplicate operations
- Audit logging for compliance

---

## 15. Monitoring & Analytics

### 15.1 Vercel Analytics

- Page views tracking
- Core Web Vitals
- Speed insights

### 15.2 Custom Analytics

| Metric            | Description                                |
| ----------------- | ------------------------------------------ |
| Session Analytics | Duration, completion rate, drop-off points |
| User Engagement   | Practice frequency, session counts         |
| Fluency Progress  | Score trends, level progression            |
| Revenue Health    | Package sales, active subscriptions        |

---

## 16. Future Considerations

### 16.1 Planned Features

1. **Mobile Applications** - React Native / Expo
2. **Advanced AI Models** - Custom fine-tuned fluency models
3. **Group Sessions** - Multi-participant practice rooms
4. **Enhanced Analytics** - Advanced reporting dashboards
5. **Gamification** - Achievements, streaks, leaderboards

### 16.2 Scalability Considerations

- Database read replicas for high traffic
- CDN for static asset delivery
- WebSocket scaling for LiveKit
- API rate limit optimization

---

_Document Version: 1.0_
_Last Updated: March 2026_
_Project: Englivo - English Fluency for Professionals_
