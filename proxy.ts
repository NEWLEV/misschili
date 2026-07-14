import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiter for single-instance deployment
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ─── Security Headers (all routes) ────────────────
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://api.fontshare.com",
      "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
      "font-src 'self' https://cdn.fontshare.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' ws: wss: https://api.stripe.com https://api.fontshare.com",
      "frame-src https://js.stripe.com",
    ].join('; ')
  );

  // ─── Rate Limiting on Auth Routes ─────────────────
  if (pathname === '/api/auth/signin' || pathname === '/api/auth/callback/credentials') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
    const allowed = rateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }
  }

  // ─── Admin Route Protection ───────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('next-auth.session-token')?.value
      || request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!token) {
      const loginUrl = new URL('/api/auth/signin', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // JWT role verification happens server-side in the admin layout
    // The middleware ensures a session token exists; the layout verifies ADMIN role
    // This prevents any admin UI from being rendered for non-admin users
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
