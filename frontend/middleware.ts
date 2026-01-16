import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/403'];
const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ['/admin'],
  BO: ['/bo'],
  USER: ['/shop'],
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes - allow access
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookies (or localStorage via header)
  const token = request.cookies.get('authToken')?.value;
  const userStr = request.cookies.get('authUser')?.value;

  // Protected routes require auth
  if (!token || !userStr) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Allow dashboard and other routes to handle auth internally with client-side context
    return NextResponse.next();
  }

  // Decode user to check role (in production, verify JWT signature)
  try {
    const user = JSON.parse(userStr);
    
    // Check role-based route access
    for (const [role, routes] of Object.entries(ROLE_ROUTES)) {
      if (user.role !== role) {
        for (const route of routes) {
          if (pathname.startsWith(route)) {
            return NextResponse.redirect(new URL('/403', request.url));
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to parse user:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
