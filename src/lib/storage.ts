import LZString from 'lz-string';
import { CapsuleData } from './types';

const STORAGE_KEY = 'joraaa_saved_capsules';

// Encode capsule into an ultra-compact URL hash string for 100% serverless, zero-config sharing
export function encodeCapsule(capsule: CapsuleData): string {
  try {
    const jsonStr = JSON.stringify(capsule);
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (err) {
    console.error('Failed to encode capsule:', err);
    return '';
  }
}

// Decode compressed capsule from URL hash
export function decodeCapsule(compressedStr: string): CapsuleData | null {
  try {
    const jsonStr = LZString.decompressFromEncodedURIComponent(compressedStr);
    if (!jsonStr) return null;
    return JSON.parse(jsonStr) as CapsuleData;
  } catch (err) {
    console.error('Failed to decode capsule:', err);
    return null;
  }
}

// Local Storage for sender's personal memory vault
export function saveToLocalVault(capsule: CapsuleData) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalVault();
    const filtered = existing.filter((c) => c.id !== capsule.id);
    const updated = [capsule, ...filtered].slice(0, 30); // keep up to 30 memories
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage limit reached or disabled', e);
  }
}

export function getLocalVault(): CapsuleData[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Auto-compress image to WebP with target width to keep URLs fast and lightweight
export async function compressImage(file: File, maxWidth = 1000, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export as WebP for high compression ratio
        const webpUrl = canvas.toDataURL('image/webp', quality);
        resolve(webpUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
