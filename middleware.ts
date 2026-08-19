import { NextRequest, NextResponse } from 'next/server';

// In-memory store: key -> { count, resetAt }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) rateLimitStore.delete(key);
  }
}, 5 * 60 * 1000);

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= limit) {
    return false; // blocked
  }

  entry.count++;
  return true; // allowed
}

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function middleware(request: NextRequest) {
  const { pathname, method } = request.nextUrl;
  const ip = getIP(request);

  let allowed = true;

  // POST /api/auth/login — 10 per 15 minutes
  if (pathname === '/api/auth/login' && method === 'POST') {
    allowed = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  }

  // POST /api/auth/register — 5 per hour
  else if (pathname === '/api/auth/register' && method === 'POST') {
    allowed = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  }

  // POST /api/auth/forgot-password — 5 per hour
  else if (pathname === '/api/auth/forgot-password' && method === 'POST') {
    allowed = rateLimit(`forgot:${ip}`, 5, 60 * 60 * 1000);
  }

  // POST /api/bookings — 20 per hour
  else if (pathname === '/api/bookings' && method === 'POST') {
    allowed = rateLimit(`booking:${ip}`, 20, 60 * 60 * 1000);
  }

  // GET /api/packages — 100 per minute
  else if (pathname.startsWith('/api/packages') && method === 'GET') {
    allowed = rateLimit(`packages:${ip}`, 100, 60 * 1000);
  }

  // All other /api/* — 200 per minute
  else if (pathname.startsWith('/api/')) {
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
