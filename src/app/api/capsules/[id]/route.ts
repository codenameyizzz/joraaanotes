import { NextResponse } from 'next/server';

// Note: For Next.js App Router dynamic route handler
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Note: If you connect Supabase, query `supabase.from('capsules').select('*').eq('id', id).single()`
    return NextResponse.json({
      message: 'Use client-side hash or connect Supabase database for direct id lookup',
      id,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve capsule' }, { status: 500 });
  }
}
