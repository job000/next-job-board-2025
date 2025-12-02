import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  const route = request.nextUrl.pathname;
  const isPrivate= route.startsWith('/job-seeker') || route.startsWith('/recruiter');

  //Access token:
  const token = request.cookies.get('token')?.value;

    // If the route is private and no token is found, redirect to /login
    if (isPrivate && !token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    //If is not private and token exists, get role from token and redirect to respective dashboard
    if (!isPrivate && token) {
        try {
            const role = request.cookies.get('role')?.value;
            const path = `/${role}/dashboard`;
            return NextResponse.redirect(new URL(path, request.url));
        } catch (error: any) {
            console.error('Proxy error:', error.message);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
  return NextResponse.next();

}
 
// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}