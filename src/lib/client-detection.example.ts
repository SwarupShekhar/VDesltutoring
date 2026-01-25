/**
 * EXAMPLE: How to use client detection in API routes
 * 
 * This file demonstrates how to distinguish between web and mobile app requests
 * using the X-Client header infrastructure.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientPlatform, isAppClient, getClientConfig } from '@/lib/client-detection';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * Example 1: Basic client detection
 */
export async function GET(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get client platform
    const client = getClientPlatform(req);

    // Example: Return different data based on client
    if (client === 'app') {
        // Mobile app gets optimized response
        return NextResponse.json({
            message: 'Mobile app response',
            data: {
                // Minimal data for mobile
                userId,
                platform: 'app'
            }
        });
    } else {
        // Web gets full response
        return NextResponse.json({
            message: 'Web response',
            data: {
                // Full data for web
                userId,
                platform: 'web',
                additionalWebData: '...'
            }
        });
    }
}

/**
 * Example 2: Using helper functions
 */
export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if request is from app
    if (isAppClient(req)) {
        console.log('[API] Processing mobile app request');

        // Mobile-specific logic
        // e.g., send push notification instead of email
    }

    const body = await req.json();

    // Process request...

    return NextResponse.json({ success: true });
}

/**
 * Example 3: Using client config
 */
export async function PUT(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientConfig = getClientConfig(req);

    // Use config to enable/disable features
    if (clientConfig.features.enablePushNotifications) {
        // Send push notification (app only)
    }

    if (clientConfig.features.enableOfflineMode) {
        // Return data optimized for offline sync (app only)
    }

    return NextResponse.json({
        platform: clientConfig.platform,
        features: clientConfig.features
    });
}

/**
 * Example 4: Real-world usage in existing endpoint
 * 
 * How to modify /api/me to support both web and app:
 */
export async function EXAMPLE_ME_ROUTE(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = getClientPlatform(req);

    const user = await prisma.users.findUnique({
        where: { clerkId: userId },
        include: {
            student_profiles: true,
            user_fluency_profile: true
        }
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Base response
    const response = {
        user_id: user.id,
        name: user.full_name,
        email: user.email,
        subscription_state: {
            cefr_level: user.user_fluency_profile?.cefr_level || 'A1',
            fluency_score: user.user_fluency_profile?.fluency_score || 0,
            confidence: user.user_fluency_profile?.confidence || 0,
            confidence_band: user.user_fluency_profile?.confidence_band || 'Low',
            last_updated: user.user_fluency_profile?.last_updated || new Date(),
            is_preliminary: !user.user_fluency_profile
        }
    };

    // Add platform-specific fields
    if (client === 'app') {
        // Mobile app might need additional fields
        return NextResponse.json({
            ...response,
            app_version_required: '1.0.0',
            features_enabled: ['offline_mode', 'push_notifications']
        });
    } else {
        // Web might need different fields
        return NextResponse.json({
            ...response,
            web_features: ['real_time_updates', 'advanced_analytics']
        });
    }
}
