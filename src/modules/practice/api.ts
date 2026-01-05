/**
 * Practice Module - API
 * 
 * API handlers for practice mode.
 * Called by route handlers in /app/api/practice/
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getPracticeTurn } from './logic'

/**
 * Handle GET request for next practice turn
 */
export async function handleGetPracticeTurn(request: Request) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get fluency score from query params
    const { searchParams } = new URL(request.url)
    const fluencyScoreParam = searchParams.get('fluencyScore')
    const fluencyScore = fluencyScoreParam ? parseFloat(fluencyScoreParam) : 0.5

    // Get practice turn based on fluency score
    const turn = getPracticeTurn(fluencyScore)

    return NextResponse.json(turn)
}
