import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type ProtectedRoutes = Record<string, string>;

export async function proxy(request: NextRequest) {
  const session = await fetch(`${request.nextUrl.origin}/api/user/me`, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  }).then((res) => res.json());

  if (!session?.discordId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const protectedRoutes: ProtectedRoutes = {
    "/dashboard/database-characters": process.env.DISCORD_VEDENI_ROLE_ID as string,
    "/dashboard/vehicles": process.env.DISCORD_VEDENI_ROLE_ID as string,
  };

  const path = request.nextUrl.pathname;

  if (protectedRoutes[path]) {
    const requiredRole = protectedRoutes[path];
    const userRoles = session.roles || [];

    if (!userRoles.includes(requiredRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/database-characters/:path*"],
};
