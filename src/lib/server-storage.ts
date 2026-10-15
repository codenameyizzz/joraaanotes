import { put, list } from '@vercel/blob';
import { Redis } from '@upstash/redis';
import { CapsuleData } from './types';

// In-memory fallback for local dev or single-instance runs
const memoryStore = new Map<string, CapsuleData>();

/**
 * Find the Vercel Blob token.
 * Vercel can name the env var BLOB_READ_WRITE_TOKEN or [STORENAME]_READ_WRITE_TOKEN (e.g. JORAAA_READ_WRITE_TOKEN).
 */
export function getBlobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN.trim() !== '') {
    return process.env.BLOB_READ_WRITE_TOKEN.trim();
  }

  // Look for any environment variable containing BLOB and ending in TOKEN or _READ_WRITE_TOKEN
  for (const [key, value] of Object.entries(process.env)) {
    const isBlobToken =
      (key.includes('BLOB') && key.includes('TOKEN')) ||
      key.endsWith('_READ_WRITE_TOKEN') ||
      key === 'STORAGE_TOKEN';

    if (isBlobToken && typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }

  return undefined;
}

export function hasVercelBlob(): boolean {
  return Boolean(getBlobToken() || process.env.BLOB_STORE_ID);
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
      const blobToken = getBlobToken();
      const putOptions: any = {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      };
      if (blobToken) {
        putOptions.token = blobToken;
      }

      // Vercel Blob put works with BLOB_STORE_ID or token automatically
      const blob = await put(`capsules/${capsule.id}.json`, JSON.stringify(capsule), putOptions);

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
    // A. Direct fetch from public store URL if BLOB_STORE_ID exists (ultra-fast edge)
    const storeId = process.env.BLOB_STORE_ID;
    if (storeId) {
      try {
        const publicUrl = `https://${storeId}.public.blob.vercel-storage.com/capsules/${id}.json`;
        const res = await fetch(publicUrl, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            return data as CapsuleData;
          }
        }
      } catch (err) {
        console.warn('Direct blob fetch error:', err);
      }
    }

    // B. List method
    try {
      const blobToken = getBlobToken();
      const listOptions: any = {
        prefix: `capsules/${id}`,
      };
      if (blobToken) {
        listOptions.token = blobToken;
      }

      const { blobs } = await list(listOptions);

      if (blobs && blobs.length > 0) {
        // Find exact match or first matching file
        const target = blobs.find((b) => b.pathname.includes(id)) || blobs[0];
        const fetchUrl = target.downloadUrl || target.url;

        const res = await fetch(fetchUrl, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          return data as CapsuleData;
        }
      }
    } catch (err) {
      console.error('Failed to get from Vercel Blob list:', err);
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
