import { Redis } from '@upstash/redis'

// Optimized for Build-Time Resilience
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

export const redis = (redisUrl && redisToken) 
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : ({
      // Mock for build-time safety
      incr: async () => 0,
      expire: async () => false,
      hgetall: async () => null,
      hincrby: async () => 0,
    } as any as Redis)
