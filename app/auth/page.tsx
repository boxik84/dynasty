import type { Metadata } from "next";

import { AuthScreen } from "@/components/auth/auth-screen";
import { isDiscordAuthConfigured } from "@/lib/auth";
import { logInfo, logWarn } from "@/lib/fivemanage-logger";

export const metadata: Metadata = {
  title: "Dynasty RP | Přihlášení",
  description:
    "Přihlášení do Dynasty RP portálu probíhá výhradně přes Discord OAuth.",
};

type AuthPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function resolveRedirect(target?: string | string[]) {
  if (Array.isArray(target)) {
    return resolveRedirect(target[0]);
  }

  if (!target || typeof target !== "string") {
    return "/dashboard";
  }

  if (!target.startsWith("/") || target.startsWith("//")) {
    return "/dashboard";
  }

  return target;
}

function resolveError(searchParams?: Record<string, string | string[] | undefined>) {
  const rawError = searchParams?.error;

  if (Array.isArray(rawError)) {
    return rawError[0] ?? null;
  }

  return rawError ?? null;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const redirectTo = resolveRedirect(params?.redirectTo);
  const initialError = resolveError(params);

  if (!isDiscordAuthConfigured) {
    void logWarn("Auth page rendered without Discord OAuth configuration", {
      metadata: {
        redirectTo,
      },
    });
  }

  if (initialError) {
    void logInfo("Auth page rendered with error state", {
      metadata: {
        redirectTo,
        error: initialError,
      },
    });
  }

  return (
    <AuthScreen
      key={`${Number(isDiscordAuthConfigured)}-${initialError ?? "none"}`}
      redirectTo={redirectTo}
      initialError={initialError}
      discordReady={isDiscordAuthConfigured}
    />
  );
}
