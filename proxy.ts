import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiter for single-instance deployment
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(key: string, maxAttempts: number = 20, windowMs: number = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false;
  }

  entry.count++;
  return true;
}

// `X-Forwarded-For`'s leftmost entry is fully client-controlled and trivially
// spoofable to bypass rate limiting entirely — a request can just set it to
// a fresh random value every time. `X-Real-IP` and the *last* hop of
// X-Forwarded-For are the values a well-behaved reverse proxy sets/appends
// itself (overwriting whatever the client sent), so they're the safer
// choice when the app sits behind exactly one trusted proxy. Verify this
// matches the actual Hostinger edge topology in production — if requests
// reach this app directly with no proxy in front, none of these headers
// can be trusted and rate limiting needs a different signal entirely.
function clientIp(request: NextRequest): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const hops = forwardedFor.split(',').map((h) => h.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  return 'unknown';
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
      // 'unsafe-eval' is dropped in production — it's only needed by Next's
      // dev-mode Fast Refresh, never by the shipped app. 'unsafe-inline' on
      // script-src remains for now (the theme-bootstrap inline script and
      // JSON-LD blocks aren't nonce-tagged yet); tightening that further
      // needs a nonce plumbed from this proxy into layout.tsx and verified
      // in a real browser before shipping, not guessed at blind.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''} https://js.stripe.com https://api.fontshare.com`,
      "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
      "font-src 'self' https://cdn.fontshare.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' ws: wss: https://api.stripe.com https://api.fontshare.com",
      "frame-src https://js.stripe.com",
    ].join('; ')
  );

  // ─── Rate Limiting on Auth Routes ─────────────────
  const rateLimitedRoutes: Record<string, string> = {
    '/api/auth/signin': 'Too many login attempts. Please try again in 5 minutes.',
    '/api/auth/callback/credentials': 'Too many login attempts. Please try again in 5 minutes.',
    '/api/account/signup': 'Too many signup attempts. Please try again in 5 minutes.',
    '/api/account/forgot-password': 'Too many requests. Please try again in 5 minutes.',
    '/api/account/reset-password': 'Too many requests. Please try again in 5 minutes.',
    '/api/coupons/validate': 'Too many attempts. Please try again in 5 minutes.',
  };

  if (pathname in rateLimitedRoutes) {
    const ip = clientIp(request);
    const allowed = rateLimit(`${ip}:${pathname}`, pathname === '/api/coupons/validate' ? 30 : 20);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: rateLimitedRoutes[pathname] },
        { status: 429 }
      );
    }
  }

  // ─── Admin Route Protection ───────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('authjs.session-token')?.value
      || request.cookies.get('__Secure-authjs.session-token')?.value;

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
