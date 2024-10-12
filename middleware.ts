import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

// // 1. Define route access for each role within the admin system
// const roleBasedRoutes: { [key: string]: string[] } = {
//     superadmin: ['/main/admin','/main/setting'], // Routes accessible by 'superadmin'
//     manager: ['/main/setting'], // Routes accessible by 'manager'
//     customer: ['/custom'], // Routes accessible by 'customer' users
// };
const roleBasedRoutes: { [key: string]: string[] } = {
    superadmin: ['/main','/main'], // Routes accessible by 'superadmin'
    manager: ['/main'], // Routes accessible by 'manager'
    customer: ['/custom'], // Routes accessible by 'customer' users
};
// const roleBasedRoutes: { [key: string]: string[] } = {
//   admin: ['/main'], // Routes accessible by 'admin' users
//   customer: ['/custom'], // Routes accessible by 'customer' users
// };

// Public routes accessible without authentication
const publicRoutes = ['/auth/login', '/auth/signup'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 2. Get session from cookies
  const cookie = cookies().get('session')?.value;
  const session = await decrypt(cookie);

  // Debugging: log the session object (optional for testing)
  // console.log('Session:', session);

  // 3. Redirect unauthenticated users trying to access protected routes
  if (!session?.email) {
    // If accessing any private routes like /main or /custom, redirect to login
    if (path.startsWith('/main') || path.startsWith('/custom')) {
      return NextResponse.redirect(new URL('/auth/login', req.nextUrl));
    }
    // Redirect root path to login if user is not authenticated
    if (path === '/') {
      return NextResponse.redirect(new URL('/auth/login', req.nextUrl));
    }
  }

  // 4. Check if the authenticated user is accessing routes not allowed for their role
  if (session?.role) {
    const allowedRoutes = roleBasedRoutes[session.role] || [];

    // Debugging: log allowed routes for the user's role
    // console.log('Allowed Routes for Role:', allowedRoutes);

    // If the current path does not start with any allowed route for the user's role, redirect them
    const isAuthorizedRoute = allowedRoutes.some((route) => path.startsWith(route));

    // Redirect the user if they are trying to access unauthorized routes
    if (!isAuthorizedRoute && !publicRoutes.includes(path)) {
      return NextResponse.redirect(new URL(allowedRoutes[0], req.nextUrl)); // Redirect to first allowed route
    }
  }

  // 5. Redirect authenticated users away from public routes (like login and signup)
  if (session?.email && publicRoutes.includes(path)) {
    const allowedRoutes = roleBasedRoutes[session.role] || [];
    return NextResponse.redirect(new URL(allowedRoutes[0], req.nextUrl));
  }

  // 6. Allow the request to proceed if all checks pass
  return NextResponse.next();
}

// Middleware should not run on API routes, _next/static, etc.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
