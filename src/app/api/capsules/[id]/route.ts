import { NextResponse } from 'next/server';
import { getCapsuleFromServer } from '@/lib/server-storage';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Capsule ID is required' }, { status: 400 });
    }

    const capsule = await getCapsuleFromServer(id);

    if (!capsule) {
      return NextResponse.json(
        { error: 'Capsule not found on server' },
        { status: 404 }
      );
    }

    return NextResponse.json({ capsule });
  } catch (error) {
    console.error('Failed to get capsule:', error);
    return NextResponse.json({ error: 'Failed to retrieve capsule' }, { status: 500 });
  }
}
