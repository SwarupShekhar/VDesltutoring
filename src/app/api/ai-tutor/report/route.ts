import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const REPORT_PROMPT = `
You are an expert English linguist. Analyze the following student transcript.
Generate a structured JSON report.

Assessment Criteria:
1. Fluency Score (0-100)
2. Grammar Score (0-100)
3. Vocabulary Score (0-100)
4. Key Feedback (3 bullet points)
5. Corrections: Identify 3 grammatical mistakes (if any). Format: "You said: [x] => Better: [y]"

Output JSON exactly like this:
{
  "scores": {
    "fluency": 85,
    "grammar": 78,
    "vocabulary": 80
  },
  "feedback": [
    "Good use of past tense.",
    "Try to speak more confidently.",
    "Watch out for subject-verb agreement."
  ],
  "corrections": [
    { "original": "I go to store yesterday.", "correction": "I went to the store yesterday.", "explanation": "Use past tense." }
  ]
}
`

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json()

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: { responseMimeType: "application/json" }
    })

    const result = await model.generateContent(REPORT_PROMPT + "\n\nTRANSCRIPT:\n" + transcript)

    const responseText = result.response.text()
    const report = JSON.parse(responseText)

    return NextResponse.json(report)
  } catch (error) {
    console.error("Report generation failed:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
