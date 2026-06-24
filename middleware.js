import { NextResponse } from 'next/server';
import { getSessionCookieName, verifyAdminSessionToken } from '@/lib/auth/session';

export const middleware = async (request) => {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const sessionToken = request.cookies.get(getSessionCookieName())?.value;
    const session = await verifyAdminSessionToken(sessionToken);

    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnTo', `${pathname}${request.nextUrl.search}`);

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
