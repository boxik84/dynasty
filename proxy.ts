import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import type { LogContext } from "@/lib/fivemanage-logger";
import { logError, logInfo, logSecurityEvent } from "@/lib/fivemanage-logger";

const SIGNED_IN_REDIRECT = "/dashboard";
const SIGNED_OUT_REDIRECT = "/auth";

const PUBLIC_PATHS = new Set([
  "/",
  "/auth",
  "/robots.txt",
  "/sitemap.xml",
  "/site.webmanifest",
  "/favicon.ico",
  "/apple-touch-icon.png",
]);

const PUBLIC_PREFIXES = [
  "/auth/",
  "/api/auth",
  "/_next",
  "/static",
  "/assets",
  "/public",
  "/images",
  "/fonts",
];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/account",
  "/profile",
  "/settings",
  "/characters",
  "/crew",
  "/factions",
  "/missions",
  "/jobs",
  "/economy",
  "/reports",
  "/management",
  "/analytics",
  "/admin",
];

const AUTH_ROUTES = ["/auth"];

function buildRequestContext(request: NextRequest): LogContext {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? undefined;
  const ip = forwardedFor?.split(",")[0]?.trim() ?? null;

  return {
    method: request.method,
    path: request.nextUrl.pathname,
    search: request.nextUrl.search || undefined,
    ip,
    userAgent: request.headers.get("user-agent"),
    host: request.headers.get("host"),
    requestId:
      request.headers.get("x-request-id") ??
      request.headers.get("cf-ray") ??
      request.headers.get("x-vercel-id") ??
      null,
  };
}

function extractSessionMetadata(session: unknown) {
  if (!session || typeof session !== "object") {
    return undefined;
  }

  const candidate = session as Record<string, unknown>;
  const metadata: Record<string, unknown> = {};

  const sessionObject = candidate.session as Record<string, unknown> | undefined;
  const userObject = candidate.user as Record<string, unknown> | undefined;

  const sessionId =
    (typeof candidate.id === "string" && candidate.id) ||
    (sessionObject && typeof sessionObject.id === "string" && sessionObject.id);
  if (sessionId) {
    metadata.sessionId = sessionId;
  }

  const userId =
    (typeof candidate.userId === "string" && candidate.userId) ||
    (sessionObject && typeof sessionObject.userId === "string" && sessionObject.userId) ||
    (userObject && typeof userObject.id === "string" && userObject.id);
  if (userId) {
    metadata.userId = userId;
  }

  const expiresAt =
    sessionObject &&
    (typeof sessionObject.expiresAt === "string"
      ? sessionObject.expiresAt
      : typeof sessionObject.expiresAt === "number"
        ? sessionObject.expiresAt
        : undefined);

  if (expiresAt) {
    metadata.expiresAt = expiresAt;
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

async function resolveSession(request: NextRequest, context: LogContext) {
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
    void logError("Failed to resolve session in proxy", {
      error,
      context,
      metadata: { phase: "resolveSession" },
    });
    return null;
  }
}

function redirect(url: URL) {
  return NextResponse.redirect(url);
}

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function matchesPrefix(pathname: string, prefix: string) {
  const normalizedPrefix = normalizePath(prefix);
  const normalizedPath = normalizePath(pathname);

  if (normalizedPrefix === "/") {
    return normalizedPath === "/";
  }

  return (
    normalizedPath === normalizedPrefix ||
    normalizedPath.startsWith(`${normalizedPrefix}/`)
  );
}

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

function isAuthPath(pathname: string) {
  return AUTH_ROUTES.some((route) => matchesPrefix(pathname, route));
}

function requiresProtection(pathname: string) {
  if (isPublicPath(pathname)) {
    return false;
  }

  if (pathname.startsWith("/_next")) {
    return false;
  }

  if (pathname.startsWith("/api/auth")) {
    return false;
  }

  if (pathname.startsWith("/api")) {
    return true;
  }

  return PROTECTED_PREFIXES.some((prefix) =>
    matchesPrefix(pathname, prefix)
  );
}

export async function proxy(request: NextRequest) {
  const requestContext = buildRequestContext(request);
  const session = await resolveSession(request, requestContext);
  const { pathname, search } = request.nextUrl;
  const normalizedPath = normalizePath(pathname || "/");

  const redirectTarget = `${pathname}${search}`;

  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    if (!session) {
      void logSecurityEvent("Blocked unauthenticated API request", {
        context: requestContext,
        metadata: {
          path: pathname,
          search,
          reason: "SESSION_REQUIRED",
          enforcement: "proxy",
        },
      });
      return NextResponse.json(
        {
          error: "SESSION_REQUIRED",
          message: "Neautorizovaný přístup. Přihlas se prosím přes Discord.",
        },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  if (session && isAuthPath(normalizedPath)) {
    const sessionMetadata = extractSessionMetadata(session);
    void logInfo("Authenticated session attempted to access auth route", {
      context: requestContext,
      metadata: {
        path: normalizedPath,
        redirect: SIGNED_IN_REDIRECT,
        ...(sessionMetadata ? { session: sessionMetadata } : {}),
      },
    });
    return redirect(new URL(SIGNED_IN_REDIRECT, request.url));
  }

  if (!session && requiresProtection(normalizedPath)) {
    const signInUrl = new URL(SIGNED_OUT_REDIRECT, request.url);
    signInUrl.searchParams.set("redirectTo", redirectTarget);
    void logSecurityEvent("Redirected unauthenticated visitor to sign-in", {
      context: { ...requestContext, redirectTo: redirectTarget },
      metadata: {
        path: normalizedPath,
        reason: "PROTECTED_ROUTE",
      },
    });
    return redirect(signInUrl);
  }

  if (session && requiresProtection(normalizedPath)) {
    const sessionMetadata = extractSessionMetadata(session);
    void logInfo("Authenticated request allowed through protected route", {
      context: requestContext,
      metadata: {
        path: normalizedPath,
        ...(sessionMetadata ? { session: sessionMetadata } : {}),
      },
    });
  }

  return NextResponse.next();
}
