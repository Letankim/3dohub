import { NextRequest, NextResponse } from 'next/server';

/**
 * Public dynamic redirect handler for shortened URLs: /s/[code]
 * Seamlessly proxies the redirect through the FastAPI backend to record analytics
 * (IP, User-Agent, Referer) and immediately returns a 302 redirect to the destination URL.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params?.code;

  if (!code || typeof code !== 'string') {
    return NextResponse.redirect(new URL('/tien-ich/rut-gon-link', request.url), 302);
  }

  try {
    const backendHost = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000';
    const targetEndpoint = `${backendHost}/s/${encodeURIComponent(code)}`;

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '';
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';

    const backendRes = await fetch(targetEndpoint, {
      method: 'GET',
      headers: {
        'x-forwarded-for': clientIp,
        'user-agent': userAgent,
        'referer': referer,
      },
      redirect: 'manual',
      cache: 'no-store',
    });

    // Check if backend returned a 301/302 redirect
    const location = backendRes.headers.get('location');
    if (location) {
      // If backend redirected to original destination URL:
      if (location.startsWith('http://') || location.startsWith('https://')) {
        return NextResponse.redirect(new URL(location), 302);
      }
      // If backend redirected to relative error path
      return NextResponse.redirect(new URL(location, request.url), 302);
    }

    // Fallback: If backend returned 404 or other status
    return NextResponse.redirect(
      new URL('/tien-ich/rut-gon-link?error=not_found', request.url),
      302
    );
  } catch (error) {
    console.error(`[ShortLink Redirect] Error resolving code '${code}':`, error);
    return NextResponse.redirect(
      new URL('/tien-ich/rut-gon-link?error=server_error', request.url),
      302
    );
  }
}

