import { NextResponse } from 'next/server';
import { CapsuleData } from '@/lib/types';

// Server-side cache/memory store for fast free deployment on Vercel
// Extensible to Supabase if NEXT_PUBLIC_SUPABASE_URL is set in environment variables
const capsuleStore = new Map<string, CapsuleData>();

export async function POST(req: Request) {
  try {
    const data: CapsuleData = await req.json();
    if (!data || !data.id) {
      return NextResponse.json({ error: 'Invalid capsule data' }, { status: 400 });
    }

    // Save into server memory
    capsuleStore.set(data.id, data);

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('API save error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  const list = Array.from(capsuleStore.values()).map((c) => ({
    id: c.id,
    title: c.title,
    author: c.author,
    dateStr: c.dateStr,
    theme: c.theme,
  }));
  return NextResponse.json({ capsules: list });
}
