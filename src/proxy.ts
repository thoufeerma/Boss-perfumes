import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Try to get the cookie name from process.env, fallback strictly used in dev if missing
  const cookieName = process.env.JWT_COOKIE_NAME || "bossperfumes_auth";
  
  const token = request.cookies.get(cookieName);

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/addresses/:path*',
    '/profile/:path*',
    '/settings/:path*'
  ],
};
