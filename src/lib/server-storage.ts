import { put, list } from '@vercel/blob';
import { Redis } from '@upstash/redis';
import { CapsuleData } from './types';

// In-memory fallback for local dev or single-instance runs
const memoryStore = new Map<string, CapsuleData>();

export function hasVercelBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function hasPersistentStorage(): boolean {
  return Boolean(
    hasVercelBlob() ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  );
}

/**
 * Connect to Upstash Redis (if configured)
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

/**
 * Save capsule to Vercel Blob, Upstash Redis, or memory store
 */
export async function saveCapsuleToServer(capsule: CapsuleData): Promise<{
  success: boolean;
  id: string;
  storageType: 'blob' | 'redis' | 'memory';
  url?: string;
}> {
  // 1. Primary: Vercel Blob (Free 1GB built into Vercel Hobby plan!)
  if (hasVercelBlob()) {
    try {
      const blob = await put(`capsules/${capsule.id}.json`, JSON.stringify(capsule), {
        access: 'public',
        addRandomSuffix: false,
      });

      return {
        success: true,
        id: capsule.id,
        storageType: 'blob',
        url: blob.url,
      };
    } catch (err) {
      console.error('Failed to save to Vercel Blob:', err);
    }
  }

  // 2. Secondary: Upstash Redis (if configured)
  const redis = getRedisClient();
  if (redis) {
    try {
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

  // 3. Fallback to memory
  memoryStore.set(capsule.id, capsule);
  return {
    success: true,
    id: capsule.id,
    storageType: 'memory',
  };
}

/**
 * Retrieve capsule from Vercel Blob, Upstash Redis, or memory store
 */
export async function getCapsuleFromServer(id: string): Promise<CapsuleData | null> {
  // 1. Check Vercel Blob
  if (hasVercelBlob()) {
    try {
      const { blobs } = await list({ prefix: `capsules/${id}.json` });
      if (blobs && blobs.length > 0) {
        const res = await fetch(blobs[0].url, { next: { revalidate: 60 } });
        if (res.ok) {
          const data = await res.json();
          return data as CapsuleData;
        }
      }
    } catch (err) {
      console.error('Failed to get from Vercel Blob:', err);
    }
  }

  // 2. Check Redis
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

  // 3. Check memory
  return memoryStore.get(id) || null;
}
