import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Block access to /admin if not logged in (can expand logic here)
  if (pathname.startsWith('/admin')) {
    // You’ll handle auth logic inside pages or use session context
    // This just sets the rule to secure these routes
    // Optionally redirect to login:
    // return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
