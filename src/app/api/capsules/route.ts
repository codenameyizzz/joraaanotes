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
  } catch (err) {
    console.error('API save error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    hasPersistentStorage: hasPersistentStorage(),
  });
}
