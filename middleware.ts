import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// Routes accessible without authentication
const PUBLIC_ROUTES = ['/login', '/register', '/pending'];
// Routes only for admin
const ADMIN_ROUTES = ['/admin'];

export default auth((request) => {
  const { nextUrl, auth: session } = request as any;
  const pathname = nextUrl.pathname;

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isApiRoute = pathname.startsWith('/api');

  // Let API routes handle their own auth
  if (isApiRoute) return NextResponse.next();

  // Allow public routes
  if (isPublicRoute) return NextResponse.next();

  // Not authenticated → redirect to login
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = session.user as any;

  // Pending users can only see /pending
  if (user.status === 'pending' && pathname !== '/pending') {
    return NextResponse.redirect(new URL('/pending', request.url));
  }

  // Rejected/banned users redirect to login
  if ((user.status === 'rejected' || user.status === 'banned') && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Non-admin trying to access admin routes
  if (isAdminRoute && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
