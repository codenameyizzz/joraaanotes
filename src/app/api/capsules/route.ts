import { NextResponse } from 'next/server';
import { CapsuleData } from '@/lib/types';
import { saveCapsuleToServer, hasPersistentStorage } from '@/lib/server-storage';

export async function POST(req: Request) {
  try {
    const data: CapsuleData = await req.json();
    if (!data || !data.id) {
      return NextResponse.json({ error: 'Invalid capsule data' }, { status: 400 });
    }

    const result = await saveCapsuleToServer(data);

    return NextResponse.json({
      success: true,
      id: data.id,
      storageType: result.storageType,
      hasPersistentStorage: hasPersistentStorage(),
    });
  } catch (err: any) {
    console.error('API save error:', err);
    return NextResponse.json({
      error: 'Internal Server Error',
      message: err?.message || String(err),
      stack: err?.stack,
    }, { status: 500 });
  }
}

export async function GET() {
  const envKeys = Object.keys(process.env).filter(
    (k) =>
      k.includes('BLOB') ||
      k.includes('TOKEN') ||
      k.includes('KV') ||
      k.includes('STORAGE') ||
      k.includes('REDIS')
  );

  return NextResponse.json({
    status: 'ok',
    hasPersistentStorage: hasPersistentStorage(),
    matchingEnvKeys: envKeys,
    nodeEnv: process.env.NODE_ENV,
  });
}
