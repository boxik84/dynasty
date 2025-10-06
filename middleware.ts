import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define the type for protected routes
type ProtectedRoutes = {
  [key: string]: string;
}

export async function middleware(request: NextRequest) {
  // Get the user's session
  const session = await fetch(`${request.nextUrl.origin}/api/user/me`, {
    headers: {
      cookie: request.headers.get('cookie') || '',
    },
  }).then(res => res.json())

  // Check if user is authenticated
  if (!session?.discordId) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Protected routes that require specific roles
  const protectedRoutes: ProtectedRoutes = {
    '/dashboard/database-characters': process.env.DISCORD_VEDENI_ROLE_ID as string, // Vedení role ID
    '/dashboard/vehicles': process.env.DISCORD_VEDENI_ROLE_ID as string, // Vedení role ID
  }

  const path = request.nextUrl.pathname

  // Check if the current path is protected
  if (protectedRoutes[path]) {
    const requiredRole = protectedRoutes[path]
    const userRoles = session.roles || []

    // If user doesn't have the required role, redirect to dashboard
    if (!userRoles.includes(requiredRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/dashboard/database-characters/:path*',
  ],
} 