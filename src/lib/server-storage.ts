import { Redis } from '@upstash/redis';
import { CapsuleData } from './types';

// In-memory fallback for local dev or single-instance runs
const memoryStore = new Map<string, CapsuleData>();

/**
 * Connect to Upstash Redis (supported natively by Vercel KV / Upstash integration)
 */
export function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      return new Redis({ url, token });
    } catch (err) {
      console.warn('Failed to connect to Redis:', err);
      return null;
    }
  }
  return null;
}

export function hasPersistentStorage(): boolean {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  );
}

/**
 * Save capsule to Upstash Redis or memory store
 */
export async function saveCapsuleToServer(capsule: CapsuleData): Promise<{
  success: boolean;
  id: string;
  storageType: 'redis' | 'memory';
}> {
  const redis = getRedisClient();

  if (redis) {
    try {
      // Store in Redis without aggressive expiry (stored for 365 days)
      await redis.set(`capsule:${capsule.id}`, JSON.stringify(capsule), {
        ex: 31536000, // 1 year
      });

      return {
        success: true,
        id: capsule.id,
        storageType: 'redis',
      };
    } catch (err) {
      console.error('Failed to save to Redis:', err);
    }
  }

  // Fallback to memory
  memoryStore.set(capsule.id, capsule);
  return {
    success: true,
    id: capsule.id,
    storageType: 'memory',
  };
}

/**
 * Retrieve capsule from Upstash Redis or memory store
 */
export async function getCapsuleFromServer(id: string): Promise<CapsuleData | null> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const data = await redis.get(`capsule:${id}`);
      if (data) {
        if (typeof data === 'string') {
          return JSON.parse(data) as CapsuleData;
        }
        return data as CapsuleData;
      }
    } catch (err) {
      console.error('Failed to get from Redis:', err);
    }
  }

  return memoryStore.get(id) || null;
}
