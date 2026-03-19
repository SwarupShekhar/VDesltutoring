# Englivo API Contract & Documentation

## Overview

This document describes the API endpoints for the Englivo platform. All endpoints follow RESTful conventions and use JSON for request/response payloads.

### Base URL

```
https://englivo.com/api
```

### Authentication

All protected endpoints require Clerk authentication via the `__clerk_db_jwt` cookie or `Authorization: Bearer <token>` header.

### Response Format

#### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

#### Error Response

```json
{
  "error": "Error message",
  "code": "E1001",
  "details": { ... }
}
```

### Standard Error Codes

| Code  | Description          |
| ----- | -------------------- |
| E1001 | Unauthorized         |
| E1002 | Forbidden            |
| E1003 | User Not Found       |
| E1004 | Invalid Token        |
| E2001 | Invalid Request      |
| E2002 | Invalid Time Range   |
| E2003 | Invalid Role         |
| E3001 | Insufficient Credits |
| E3002 | Tutor Not Available  |
| E3003 | Time Slot Conflict   |
| E4001 | Student Not Found    |
| E4002 | Tutor Not Found      |
| E4003 | Session Not Found    |
| E9001 | Internal Error       |

---

## 1. Authentication & Users

### 1.1 Get Current User

**Endpoint:** `GET /api/me`

Retrieves the currently authenticated user's profile.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "clerkId": "string",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "LEARNER" | "TUTOR" | "ADMIN",
    "profileImageUrl": "https://...",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "student": {
      "id": "uuid",
      "credits": 10,
      "primaryTutorId": "uuid" | null,
      "learningGoals": "string"
    } | null,
    "tutor": {
      "id": "uuid",
      "bio": "string",
      "expertiseTags": ["IELTS", "Business English"],
      "hourlyRateEquivalent": 50
    } | null
  }
}
```

---

### 1.2 Clerk Webhook

**Endpoint:** `POST /api/webhooks/clerk`

Receives user lifecycle events from Clerk.

**Authentication:** Clerk signature verification

**Headers:**

- `svix-id`: Webhook ID
- `svix-timestamp`: Webhook timestamp
- `svix-signature`: Webhook signature

**Events Handled:**

- `user.created` - Create new user in database
- `user.updated` - Update user profile
- `user.deleted` - Soft delete user (set is_active = false)

---

## 2. Sessions

### 2.1 Get Sessions

**Endpoint:** `GET /api/sessions`

Retrieves sessions for the authenticated user.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (SCHEDULED, LIVE, COMPLETED, CANCELLED) |

**Response:**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "startTime": "2024-01-01T10:00:00Z",
        "endTime": "2024-01-01T11:00:00Z",
        "status": "SCHEDULED",
        "livekitRoomId": "string" | null,
        "meetingLink": "string" | null,
        "student": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "tutor": {
          "id": "uuid",
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      }
    ],
    "role": "LEARNER"
  }
}
```

---

### 2.2 Book Session

**Endpoint:** `POST /api/sessions/book`

Books a new tutoring session.

**Authentication:** Required (LEARNER role only)

**Request Body:**

```json
{
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T11:00:00Z",
  "tutorId": "uuid" | null
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "session": {
      "id": "uuid",
      "startTime": "2024-01-01T10:00:00Z",
      "endTime": "2024-01-01T11:00:00Z",
      "status": "SCHEDULED",
      "tutor": {
        "name": "Jane Smith" | null
      }
    }
  }
}
```

**Error Codes:**

- E3001: Insufficient credits
- E3002: Tutor not available
- E3003: Time slot conflict
- E2003: Only learners can book sessions

---

### 2.3 Cancel Session

**Endpoint:** `POST /api/sessions/cancel`

Cancels a scheduled session.

**Authentication:** Required

**Request Body:**

```json
{
  "sessionId": "uuid",
  "refundCredits": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Session cancelled successfully",
    "refunded": true
  }
}
```

---

### 2.4 Complete Session

**Endpoint:** `POST /api/sessions/complete`

Marks a session as completed.

**Authentication:** Required (ADMIN or TUTOR)

**Request Body:**

```json
{
  "sessionId": "uuid",
  "status": "COMPLETED" | "NO_SHOW",
  "notes": "Optional completion notes"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Session completed",
    "session": {
      "id": "uuid",
      "status": "COMPLETED"
    }
  }
}
```

---

### 2.5 Join Session

**Endpoint:** `POST /api/sessions/[id]/join`

Joins a live session.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "meetingLink": "https://..."
  }
}
```

---

## 3. LiveKit Integration

### 3.1 Get LiveKit Token

**Endpoint:** `GET /api/livekit/token`

Generates a LiveKit access token for video/audio sessions.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| mode | string | "ai" for AI practice, omitted for human session |

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "roomName": "session-uuid" | "ai-practice-uuid-timestamp"
  }
}
```

**Error Codes:**

- 401: Unauthorized (not logged in)
- 403: No scheduled or live session found
- 500: Server misconfigured

---

### 3.2 LiveKit Webhook

**Endpoint:** `POST /api/webhooks/livekit`

Receives LiveKit room events.

**Authentication:** LiveKit webhook verification

---

## 4. AI Practice

### 4.1 Evaluate Speech

**Endpoint:** `POST /api/practice/evaluate`

Evaluates user's speech during practice.

**Authentication:** Required

**Request Body:**

```json
{
  "transcript": "The user's speech transcript",
  "fluency": {
    "HESITATION": 2,
    "FILLER_OVERUSE": 3
  },
  "turn": {
    "prompt": "Tell me about yourself"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "confidence": 0.75,
    "stars": 3,
    "feedback": "Good — you answered directly. That builds real speaking ability."
  }
}
```

---

### 4.2 Practice Turn

**Endpoint:** `GET /api/practice/turn`

Gets the current practice turn/prompt.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "turn": {
      "prompt": "Tell me about your hometown",
      "scenario": "casual"
    }
  }
}
```

---

### 4.3 Save Practice

**Endpoint:** `POST /api/practice/save`

Saves practice session results.

**Authentication:** Required

**Request Body:**

```json
{
  "sessionId": "uuid",
  "transcript": "The full transcript",
  "metrics": {
    "avgPauseMs": 450,
    "midSentencePauseRatio": 0.12,
    "speechRateWpm": 140
  },
  "score": 75
}
```

---

### 4.4 Practice Evaluate (v2)

**Endpoint:** `POST /api/practice/evaluate`

Advanced practice evaluation with full metrics.

**Authentication:** Required

**Request Body:**

```json
{
  "transcript": "User's speech",
  "metrics": {
    "avgPauseMs": 450,
    "midSentencePauseRatio": 0.12,
    "pauseVariance": 0.2,
    "speechRateWpm": 140,
    "speechRateVariance": 0.15,
    "recoveryScore": 0.8
  }
}
```

---

## 5. AI Chat Tutor

### 5.1 AI Chat

**Endpoint:** `POST /api/ai`

Main AI tutor endpoint for conversational practice.

**Authentication:** Required

**Request Body:**

```json
{
  "transcript": "User's response",
  "firstName": "John",
  "metrics": {
    "flow": 70,
    "confidence": 65,
    "clarity": 80,
    "speed": 75,
    "stability": 60
  },
  "history": [
    {
      "role": "ai",
      "content": "Tell me about your job"
    },
    {
      "role": "user",
      "content": "I work as a software engineer"
    }
  ],
  "systemPromptType": "STANDARD" | "TRIAL",
  "targetLevel": "B2"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "response": "That's great! What do you enjoy most about coding?",
    "corrections": [
      {
        "original": "I work as a",
        "corrected": "I work as a",
        "type": "vocabulary"
      }
    ]
  }
}
```

---

### 5.2 Save AI Chat Session

**Endpoint:** `POST /api/ai-tutor/save`

Saves AI chat session to database.

**Authentication:** Required

**Request Body:**

```json
{
  "sessionId": "uuid",
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "ai",
      "content": "Hi! How can I help you practice today?"
    }
  ],
  "fluencyScore": 75.5,
  "grammarScore": 80,
  "vocabularyScore": 70,
  "feedbackSummary": "Good progress on fluency"
}
```

---

### 5.3 AI Tutor Report

**Endpoint:** `POST /api/ai-tutor/report`

Generates a report for an AI chat session.

**Authentication:** Required

**Request Body:**

```json
{
  "sessionId": "uuid"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "report": {
      "sessionId": "uuid",
      "summary": "Session report...",
      "recommendations": ["Practice more vocabulary"]
    }
  }
}
```

---

## 6. Speech Processing

### 6.1 Speech-to-Text

**Endpoint:** `POST /api/deepgram`

Transcribes audio to text using Deepgram.

**Authentication:** Required

**Request Body:**

```json
{
  "audio": "base64_encoded_audio",
  "mimeType": "audio/webm"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transcript": "Hello, how are you today?",
    "result": {
      "results": {
        "channels": [
          {
            "alternatives": [
              {
                "transcript": "Hello, how are you today?",
                "confidence": 0.95
              }
            ]
          }
        ]
      }
    }
  }
}
```

**Notes:**

- Minimum audio size: 1000 bytes
- Model: nova-3
- Language: en-US
- Smart formatting enabled

---

### 6.2 Text-to-Speech

**Endpoint:** `POST /api/tts`

Converts text to speech using ElevenLabs.

**Authentication:** Required

**Request Body:**

```json
{
  "text": "Hello! Welcome to Englivo.",
  "voiceId": "21m00Tcm4TlvDq8ikWAM" | null
}
```

**Response:** Audio stream (audio/mpeg)

---

### 6.3 Deepgram Token

**Endpoint:** `GET /api/deepgram/token`

Gets a streaming Deepgram token for real-time transcription.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "token_string"
  }
}
```

---

## 7. Live Practice Sessions

### 7.1 Join Live Practice

**Endpoint:** `POST /api/live-practice/join`

Joins a live practice session.

**Authentication:** Required

**Request Body:**

```json
{
  "sessionId": "uuid",
  "fluencyScore": 65,
  "goal": "conversation"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "roomName": "live-session-uuid",
    "token": "livekit_token"
  }
}
```

---

### 7.2 Leave Live Practice

**Endpoint:** `POST /api/live-practice/leave`

Leaves a live practice session.

**Authentication:** Required

**Request Body:**

```json
{
  "sessionId": "uuid"
}
```

---

### 7.3 Submit Transcript

**Endpoint:** `POST /api/live-practice/transcript`

Submits transcript for a live session.

**Authentication:** Required

**Request Body:**

```json
{
  "sessionId": "uuid",
  "text": "The transcript text",
  "userId": "uuid",
  "wordData": [
    {
      "word": "Hello",
      "start": 0.5,
      "end": 0.8,
      "confidence": 0.95
    }
  ]
}
```

---

### 7.4 Submit Metrics

**Endpoint:** `POST /api/live-practice/metrics`

Submits real-time metrics for a session.

**Authentication:** Required

**Request Body:**

```json
{
  "sessionId": "uuid",
  "userId": "uuid",
  "speakingTime": 120.5,
  "wordCount": 180,
  "hesitationCount": 5,
  "fillerCount": 3,
  "grammarErrors": 2,
  "speechRate": 145
}
```

---

### 7.5 Generate Session Report

**Endpoint:** `POST /api/live-practice/report`

Generates a comprehensive report for a live session.

**Authentication:** Required

**Request Body:**

```json
{
  "sessionId": "uuid"
}
```

---

### 7.6 Session Report (by ID)

**Endpoint:** `GET /api/live-practice/report/[sessionId]`

Gets a session report by ID.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "summary": "Session summary...",
    "metrics": {...},
    "transcript": [...]
  }
}
```

---

### 7.7 Get Micro-Fixes

**Endpoint:** `GET /api/live-practice/[sessionId]/micro-fix`

Gets micro-lessons based on session weaknesses.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "fixes": [
      {
        "category": "fillers",
        "detectedWords": ["um", "uh"],
        "upgrades": ["pause", "silence"],
        "explanation": "Replace fillers with pauses"
      }
    ]
  }
}
```

---

### 7.8 Get Live Practice Stats

**Endpoint:** `GET /api/live-practice/stats`

Gets live practice statistics for the user.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "totalSessions": 50,
    "totalMinutes": 2500,
    "averageScore": 72.5,
    "improvement": 15.2
  }
}
```

---

## 8. Fluency Tracking

### 8.1 Get Fluency History

**Endpoint:** `GET /api/fluency/history`

Gets the user's fluency practice history.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "uuid",
        "createdAt": "2024-01-01T00:00:00Z",
        "averageScore": 75.5,
        "rounds": [
          {
            "turn": 1,
            "transcript": "...",
            "score": 72
          }
        ]
      }
    ]
  }
}
```

---

### 8.2 Submit Fluency Session

**Endpoint:** `POST /api/fluency/submit`

Submits a fluency practice session.

**Authentication:** Required

**Request Body:**

```json
{
  "averageScore": 75.5,
  "rounds": [
    {
      "turn": 1,
      "transcript": "I work as a developer",
      "score": 72
    },
    {
      "turn": 2,
      "transcript": "I enjoy coding",
      "score": 79
    }
  ]
}
```

---

### 8.3 Analyze History

**Endpoint:** `POST /api/fluency/history/analyze`

Analyzes fluency history for trends.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "trends": {
      "averageScore": 75.5,
      "improvement": 5.2,
      "sessionsCount": 10
    }
  }
}
```

---

## 9. User Profile

### 9.1 Get CEFR Path

**Endpoint:** `GET /api/user/cefr-path`

Gets user's CEFR level path.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "currentLevel": "B1",
    "targetLevel": "B2",
    "progress": 65,
    "nextMilestone": "Pass B2 gate",
    "requirements": {
      "minSessions": 20,
      "completedSessions": 15,
      "minFluencyScore": 70,
      "currentFluencyScore": 68
    }
  }
}
```

---

### 9.2 Update Coach Memory

**Endpoint:** `POST /api/user/coach-memory`

Updates user's coach memory for continuity.

**Authentication:** Required

**Request Body:**

```json
{
  "focusSkill": "confidence",
  "lastWeakness": "hesitation",
  "lastSessionSummary": "Worked on reducing fillers"
}
```

---

### 9.3 Get Tutor CEFR Blockers

**Endpoint:** `GET /api/tutor/students/[userId]/cefr-blockers`

Gets lexical blockers for a student's CEFR level.

**Authentication:** Required (TUTOR or ADMIN)

**Response:**

```json
{
  "success": true,
  "data": {
    "blockers": [
      {
        "category": "vocabulary",
        "words": ["good", "nice"],
        "level": "A2",
        "upgrades": ["excellent", "wonderful"]
      }
    ]
  }
}
```

---

## 10. Admin Endpoints

### 10.1 Get Analytics

**Endpoint:** `GET /api/admin/analytics`

Gets platform analytics.

**Authentication:** Required (ADMIN only)

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1500,
    "activeUsers": 850,
    "totalSessions": 5000,
    "completionRate": 0.92,
    "revenue": 50000
  }
}
```

---

### 10.2 Get Revenue Health

**Endpoint:** `GET /api/admin/revenue-health`

Gets revenue analytics.

**Authentication:** Required (ADMIN only)

**Response:**

```json
{
  "success": true,
  "data": {
    "monthlyRevenue": 15000,
    "packagesSold": 50,
    "refundRate": 0.02
  }
}
```

---

### 10.3 Get Students

**Endpoint:** `GET /api/admin/students`

Gets all students.

**Authentication:** Required (ADMIN only)

**Response:**

```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "uuid",
        "email": "student@example.com",
        "fullName": "John Doe",
        "credits": 10,
        "role": "LEARNER"
      }
    ]
  }
}
```

---

### 10.4 Get Tutors

**Endpoint:** `GET /api/admin/tutors`

Gets all tutors.

**Authentication:** Required (ADMIN only)

**Response:**

```json
{
  "success": true,
  "data": {
    "tutors": [
      {
        "id": "uuid",
        "email": "tutor@example.com",
        "fullName": "Jane Smith",
        "bio": "Experienced English teacher",
        "expertiseTags": ["IELTS", "Business"],
        "isActive": true
      }
    ]
  }
}
```

---

### 10.5 Adjust Credits

**Endpoint:** `POST /api/admin/adjust-credits`

Adjusts a student's credit balance.

**Authentication:** Required (ADMIN only)

**Request Body:**

```json
{
  "studentId": "uuid",
  "amount": 5,
  "reason": "Bonus credits"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Credits adjusted",
    "student": {
      "id": "uuid",
      "credits": 15,
      "adjustment": 5
    }
  }
}
```

---

### 10.6 Assign Tutor

**Endpoint:** `POST /api/admin/assign-tutor`

Assigns a primary tutor to a student.

**Authentication:** Required (ADMIN only)

**Request Body:**

```json
{
  "studentId": "uuid",
  "tutorId": "uuid"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Tutor assigned",
    "student": {
      "id": "uuid",
      "primaryTutorId": "uuid"
    },
    "tutor": {
      "id": "uuid",
      "name": "Jane Smith"
    }
  }
}
```

---

### 10.7 Get Tutor Performance

**Endpoint:** `GET /api/admin/tutor-performance`

Gets performance metrics for tutors.

**Authentication:** Required (ADMIN only)

**Response:**

```json
{
  "success": true,
  "data": {
    "tutors": [
      {
        "id": "uuid",
        "name": "Jane Smith",
        "sessionsCompleted": 45,
        "averageRating": 4.8,
        "studentRetention": 0.85
      }
    ]
  }
}
```

---

### 10.8 Get At-Risk Learners

**Endpoint:** `GET /api/admin/at-risk-learners`

Gets learners at risk of churning.

**Authentication:** Required (ADMIN only)

**Response:**

```json
{
  "success": true,
  "data": {
    "learners": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "lastActive": "2024-01-01T00:00:00Z",
        "riskLevel": "high"
      }
    ]
  }
}
```

---

### 10.9 Get Learning Health

**Endpoint:** `GET /api/admin/learning-health`

Gets overall learning health metrics.

**Authentication:** Required (ADMIN only)

**Response:**

```json
{
  "success": true,
  "data": {
    "averageProgress": 12.5,
    "activeDailyPlans": 450,
    "weakestAreas": ["hesitation", "vocabulary"]
  }
}
```

---

### 10.10 Get Session Evidence

**Endpoint:** `GET /api/admin/sessions/[id]/evidence`

Gets evidence for a session.

**Authentication:** Required (ADMIN only)

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "transcripts": [...],
    "metrics": {...},
    "summary": "..."
  }
}
```

---

### 10.11 Assign Tutor to Session

**Endpoint:** `POST /api/admin/sessions/[id]/assign`

Assigns a tutor to a session.

**Authentication:** Required (ADMIN only)

**Request Body:**

```json
{
  "tutorId": "uuid"
}
```

---

### 10.12 Get QA Sessions

**Endpoint:** `GET /api/admin/qa`

Gets QA session data.

**Authentication:** Required (ADMIN only)

**Response:**

```json
{
  "success": true,
  "data": {
    "sessions": [...]
  }
}
```

---

### 10.13 Get Student Intelligence

**Endpoint:** `GET /api/admin/student/[id]/intelligence`

Gets intelligence data for a student.

**Authentication:** Required (ADMIN only)

**Response:**

```json
{
  "success": true,
  "data": {
    "studentId": "uuid",
    "cefrLevel": "B1",
    "strengths": ["fluency", "vocabulary"],
    "weaknesses": ["hesitation", "grammar"],
    "progressHistory": [...]
  }
}
```

---

### 10.14 Get Audit Logs

**Endpoint:** `GET /api/admin/audit-logs`

Gets audit logs.

**Authentication:** Required (ADMIN only)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | Filter by user |
| action | string | Filter by action type |
| limit | number | Number of results (default: 50) |

**Response:**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "userId": "uuid",
        "action": "session.book",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 11. Packages & Credits

### 11.1 Purchase Package

**Endpoint:** `POST /api/packages/purchase`

Purchases a credit package.

**Authentication:** Required

**Request Body:**

```json
{
  "packageId": "uuid"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "credits": 15,
    "added": 10
  }
}
```

---

## 12. Performance & History

### 12.1 Get Performance History

**Endpoint:** `GET /api/performance/history`

Gets user's performance history.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "date": "2024-01",
        "averageScore": 72,
        "sessionsCount": 10
      }
    ]
  }
}
```

---

## 13. Drills

### 13.1 Generate Drills

**Endpoint:** `POST /api/drills/generate`

Generates practice drills.

**Authentication:** Required

**Request Body:**

```json
{
  "weaknessTags": ["hesitation", "fillers"],
  "level": "B1",
  "count": 5
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "drills": [
      {
        "id": "uuid",
        "prompt": "Describe your daily routine",
        "difficulty": "intermediate"
      }
    ]
  }
}
```

---

## 14. Common Headers

All API requests should include:

| Header        | Value                |
| ------------- | -------------------- |
| Content-Type  | application/json     |
| Authorization | Bearer {clerk_token} |

---

## 15. Rate Limits

| Endpoint Category | Limit                |
| ----------------- | -------------------- |
| General API       | 100 requests/minute  |
| AI/TTS endpoints  | 20 requests/minute   |
| Webhooks          | 1000 requests/minute |

---

_Document Version: 1.0_
_Last Updated: March 2026_
