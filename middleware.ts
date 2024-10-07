import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

// 1. Define route access for each role
const roleBasedRoutes: { [key: string]: string[] } = {
    admin: ['/main'], // Routes accessible by 'admin' users
    customer: ['/custom'], // Routes accessible by 'customer' users
};

const publicRoutes = ['/auth/login', '/auth/signup'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 2. Get session from cookies
  const cookie = cookies().get('session')?.value;
  const session = await decrypt(cookie);

  // Debugging: log the session object
  console.log('Session:', session);

  // 3. Redirect unauthenticated users trying to access protected routes
  if (!session?.email) {
    if (path.startsWith('/main') || path.startsWith('/custom')) {
      return NextResponse.redirect(new URL('/auth/login', req.nextUrl));
    }
  }

  // 4. Check if the user is trying to access routes that are not allowed for their role
  if (session?.role) {
    const allowedRoutes = roleBasedRoutes[session.role] || [];
    console.log('Allowed Routes for Role:', allowedRoutes);

    // If the current path does not start with any allowed route for the user's role, redirect them
    const isAuthorizedRoute = allowedRoutes.some((route) => path.startsWith(route));

    if (!isAuthorizedRoute && !publicRoutes.includes(path)) {
      console.log(`Redirecting from ${path} to ${allowedRoutes[0]}`);
      return NextResponse.redirect(new URL(allowedRoutes[0], req.nextUrl));
    }
  }

  // 5. Redirect authenticated users away from public routes (like login and signup)
  if (session?.email && publicRoutes.includes(path)) {
    const allowedRoutes = roleBasedRoutes[session.role] || [];
    return NextResponse.redirect(new URL(allowedRoutes[0], req.nextUrl));
  }

  // 6. Allow the request to proceed if all checks are passed
  return NextResponse.next();
}

// Middleware should not run on API routes, _next/static, etc.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
