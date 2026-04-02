export interface BridgeUser {
  clerkId: string;
  email: string;
  fullName: string;
  cefrLevel: string;
  fluencyScore: number;
  totalPracticeMinutes: number;
  streakDays: number;
  lastActiveApp: string | null;
  preferredMode: string | null;
}

export interface UpdateUserDto {
  last_active_app?: string;
  preferred_mode?: string;
}

export interface SyncCefrDto {
  clerkId: string;
  cefrLevel: string;
  fluencyScore: number;
  source: string;
}

const BRIDGE_API_URL = process.env.BRIDGE_API_URL || 'http://localhost:3012';
const BRIDGE_SECRET = process.env.INTERNAL_BRIDGE_SECRET || process.env.INTERNAL_SECRET;

// Module startup validation to prevent silent unauthenticated requests
if (!BRIDGE_SECRET) {
  const missingVars = ['INTERNAL_BRIDGE_SECRET', 'INTERNAL_SECRET'].join(' or ');
  const errorMsg = `[Bridge API] Configuration Error: BRIDGE_SECRET is undefined. Please ensure either ${missingVars} is set in your environment variables. Authentication will fail without this secret.`;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(errorMsg);
  } else {
    console.warn('\x1b[33m%s\x1b[0m', errorMsg); // Yellow warning in terminal
  }
}

async function bridgeFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  if (!BRIDGE_SECRET) {
    console.error(`[Bridge API] Aborting request to ${endpoint} due to missing BRIDGE_SECRET.`);
    return null;
  }

  const url = `${BRIDGE_API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'x-internal-secret': BRIDGE_SECRET,
    ...options.headers,
  } as Record<string, string>;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Bridge API Error] ${endpoint}: ${response.status} ${errorText}`);
      return null;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`[Bridge API Failure] ${endpoint}:`, error);
    return null;
  }
}

export async function getBridgeUser(clerkId: string): Promise<BridgeUser | null> {
  return bridgeFetch<BridgeUser>(`/user/${clerkId}`);
}

export async function updateBridgeUser(clerkId: string, data: Partial<UpdateUserDto>): Promise<BridgeUser | null> {
  return bridgeFetch<BridgeUser>(`/user/${clerkId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function incrementStreak(clerkId: string): Promise<BridgeUser | null> {
  return bridgeFetch<BridgeUser>(`/user/${clerkId}/streak`, {
    method: 'PATCH',
  });
}

export async function addPracticeMinutes(clerkId: string, minutes: number): Promise<BridgeUser | null> {
  return bridgeFetch<BridgeUser>(`/user/${clerkId}/minutes`, {
    method: 'PATCH',
    body: JSON.stringify({ minutes }),
  });
}

export async function syncCefr(payload: SyncCefrDto): Promise<{ success: boolean } | null> {
  return bridgeFetch<{ success: boolean }>('/sync/cefr', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
