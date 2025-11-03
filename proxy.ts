import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

// Update these paths to match the sections of the app that require authentication.
const PROTECTED_PATHS = ["/dashboard"];
const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"];
const SIGNED_IN_REDIRECT = "/dashboard";
const SIGNED_OUT_REDIRECT = "/auth/sign-in";

async function resolveSession(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return null;
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    });

    return session ?? null;
  } catch (error) {
    console.error("Failed to resolve session in proxy", error);
    return null;
  }
}

function redirect(url: URL) {
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const session = await resolveSession(request);
  const { pathname } = request.nextUrl;

  const requiresSession = PROTECTED_PATHS.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (requiresSession && !session) {
    const signInUrl = new URL(SIGNED_OUT_REDIRECT, request.url);
    signInUrl.searchParams.set(
      "redirectTo",
      `${pathname}${request.nextUrl.search}`
    );
    return redirect(signInUrl);
  }

  if (session && isAuthRoute) {
    return redirect(new URL(SIGNED_IN_REDIRECT, request.url));
  }

  return NextResponse.next();
}
