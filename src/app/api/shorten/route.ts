import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Attempt 1: TinyURL API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const tinyRes = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (tinyRes.ok) {
        const shortUrl = await tinyRes.text();
        if (shortUrl && shortUrl.startsWith('http')) {
          return NextResponse.json({
            success: true,
            shortUrl: shortUrl.trim(),
            provider: 'tinyurl',
          });
        }
      }
    } catch (err) {
      console.warn('TinyURL service unavailable or timed out:', err);
    }

    // Attempt 2: is.gd API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const isgdRes = await fetch(
        `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (isgdRes.ok) {
        const shortUrl = await isgdRes.text();
        if (shortUrl && shortUrl.startsWith('http')) {
          return NextResponse.json({
            success: true,
            shortUrl: shortUrl.trim(),
            provider: 'isgd',
          });
        }
      }
    } catch (err) {
      console.warn('is.gd service unavailable or timed out:', err);
    }

    // Fallback: return the original url
    return NextResponse.json({
      success: false,
      shortUrl: url,
      fallback: true,
    });
  } catch (err) {
    console.error('URL shorten error:', err);
    return NextResponse.json({ error: 'Shorten request failed' }, { status: 500 });
  }
}
