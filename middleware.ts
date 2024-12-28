import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // Add API route specific headers
  if (request.nextUrl.pathname.startsWith('/api/')) {
    requestHeaders.set('x-url', request.url);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/profile',
    '/auth/:path*',
    '/login',
    '/preview',
    '/videolecture',
  ],
}; 