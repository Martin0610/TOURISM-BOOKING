import { NextRequest, NextResponse } from 'next/server';

// In-memory store: key -> { count, resetAt }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  const ip = getIP(request);

  let allowed = true;

  if (pathname === '/api/auth/login' && method === 'POST') {
    allowed = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  } else if (pathname === '/api/auth/register' && method === 'POST') {
    allowed = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  } else if (pathname === '/api/auth/forgot-password' && method === 'POST') {
    allowed = rateLimit(`forgot:${ip}`, 5, 60 * 60 * 1000);
  } else if (pathname === '/api/bookings' && method === 'POST') {
    allowed = rateLimit(`booking:${ip}`, 20, 60 * 60 * 1000);
  } else if (pathname.startsWith('/api/packages') && method === 'GET') {
    allowed = rateLimit(`packages:${ip}`, 100, 60 * 1000);
  } else if (pathname.startsWith('/api/')) {
    allowed = rateLimit(`api:${ip}`, 200, 60 * 1000);
  }

  if (!allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
