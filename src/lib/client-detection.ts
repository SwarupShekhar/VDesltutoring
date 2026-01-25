import { NextRequest } from 'next/server';

/**
 * Client platform types
 */
export type ClientPlatform = 'web' | 'app';

/**
 * Extract client platform from request headers
 * Reads X-Client header to distinguish between web and mobile app
 * 
 * @param req - Next.js request object
 * @returns 'app' if X-Client: app header is present, otherwise 'web'
 * 
 * @example
 * ```ts
 * // In API route
 * export async function GET(req: NextRequest) {
 *   const client = getClientPlatform(req);
 *   
 *   if (client === 'app') {
 *     // Mobile app specific logic
 *   } else {
 *     // Web specific logic
 *   }
 * }
 * ```
 */
export function getClientPlatform(req: NextRequest): ClientPlatform {
    const clientHeader = req.headers.get('x-client')?.toLowerCase();
    return clientHeader === 'app' ? 'app' : 'web';
}

/**
 * Check if request is from mobile app
 * 
 * @param req - Next.js request object
 * @returns true if request is from mobile app
 */
export function isAppClient(req: NextRequest): boolean {
    return getClientPlatform(req) === 'app';
}

/**
 * Check if request is from web
 * 
 * @param req - Next.js request object
 * @returns true if request is from web
 */
export function isWebClient(req: NextRequest): boolean {
    return getClientPlatform(req) === 'web';
}

/**
 * Get client-specific configuration
 * Useful for returning different response formats or applying different business logic
 * 
 * @param req - Next.js request object
 * @returns Configuration object with client-specific settings
 */
export function getClientConfig(req: NextRequest) {
    const platform = getClientPlatform(req);

    return {
        platform,
        isApp: platform === 'app',
        isWeb: platform === 'web',
        // Add more client-specific configs as needed
        features: {
            // Example: Different feature flags per platform
            enablePushNotifications: platform === 'app',
            enableWebSockets: true,
            enableOfflineMode: platform === 'app',
        }
    };
}
