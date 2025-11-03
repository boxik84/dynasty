"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { CheckCircle2 } from "lucide-react";

interface AuthScreenProps {
  redirectTo: string;
  initialError?: string | null;
  discordReady: boolean;
}

const errorMessages: Record<string, string> = {
  discord:
    "Nepodařilo se přihlásit přes Discord. Zkus to prosím znovu nebo ověř, zda máš na serveru správné oprávnění.",
  access_denied:
    "Přístup byl zamítnut. Potvrď prosím přihlášení v Discord okně a povol požadovaná oprávnění.",
  default:
    "Během přihlášení došlo k neočekávané chybě. Zkus akci zopakovat, případně kontaktuj podporu.",
};

const missingDiscordMessage =
  "Discord OAuth není aktuálně nakonfigurovaný. Kontaktuj administrátora, aby doplnil přístupové údaje.";

function resolveErrorMessage(initialError?: string | null) {
  if (!initialError) {
    return null;
  }

  return (
    errorMessages[initialError] ?? errorMessages.default
  );
}

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M20.317 4.369A16.257 16.257 0 0 0 16.556 3a11.3 11.3 0 0 0-.531 1.09 15.183 15.183 0 0 0-4.05 0A11.254 11.254 0 0 0 11.445 3a16.18 16.18 0 0 0-3.761 1.377C4.534 8.007 3.82 11.554 4.11 15.045a16.31 16.31 0 0 0 4.944 2.511c.398-.54.75-1.11 1.05-1.706a10.458 10.458 0 0 1-1.657-.79c.14-.1.276-.2.406-.307 3.188 1.495 6.64 1.495 9.789 0 .132.107.269.208.406.307-.53.311-1.09.568-1.676.79.3.596.652 1.166 1.05 1.706a16.29 16.29 0 0 0 4.955-2.522c.407-4.515-.704-8.032-3.66-10.655ZM8.822 13.781c-.96 0-1.748-.876-1.748-1.95 0-1.075.766-1.95 1.748-1.95.99 0 1.766.884 1.748 1.95 0 1.074-.766 1.95-1.748 1.95Zm6.379 0c-.96 0-1.748-.876-1.748-1.95 0-1.075.765-1.95 1.748-1.95.99 0 1.766.884 1.748 1.95 0 1.074-.758 1.95-1.748 1.95Z"
      />
    </svg>
  );
}

export function AuthScreen({
  redirectTo,
  initialError,
  discordReady,
}: AuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null | undefined>(
    undefined
  );

  const baseError = useMemo(() => {
    if (!discordReady) {
      return missingDiscordMessage;
    }

    return resolveErrorMessage(initialError);
  }, [discordReady, initialError]);

  const displayedError = localError === undefined ? baseError : localError;

  const handleDiscordSignIn = useCallback(async () => {
    if (!discordReady) {
      setLocalError(missingDiscordMessage);
      return;
    }

    setLocalError(null);
    setIsLoading(true);

    try {
      await authClient.signIn.social({
        provider: "discord",
        callbackURL: redirectTo,
        newUserCallbackURL: redirectTo,
        errorCallbackURL: "/auth?error=discord",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : errorMessages.default;
      setLocalError(message);
      setIsLoading(false);
    }
  }, [discordReady, redirectTo]);

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--chart-4)_0%,transparent_55%)] opacity-40" />
      <div className="absolute inset-y-0 left-0 -z-10 hidden w-1/2 bg-[radial-gradient(circle_at_left,var(--chart-2)_0%,transparent_55%)] opacity-25 lg:block" />

      <div className="relative mx-auto w-full max-w-md px-6 py-16">
        <Card className="border-border/70 bg-card/90 shadow-xl backdrop-blur">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <DiscordIcon className="size-7" />
            </div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Přihlášení přes Discord
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Přihlas se jediným kliknutím a pokračuj do Dynasty portálu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {displayedError ? (
              <Alert variant="destructive">
                <AlertDescription>{displayedError}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="button"
              onClick={handleDiscordSignIn}
              disabled={isLoading || !discordReady}
              className={cn(
                "group relative flex h-12 w-full items-center justify-center gap-3 rounded-lg",
                "bg-[#5865F2] text-white shadow-sm transition-colors",
                "hover:bg-[#4E5BD1] focus-visible:ring-4 focus-visible:ring-primary/30",
                !discordReady && "cursor-not-allowed opacity-70"
              )}
            >
              {isLoading ? (
                <Spinner className="size-5" />
              ) : (
                <DiscordIcon className="size-5" />
              )}
              {isLoading ? "Připojuji účet" : "Pokračovat přes Discord"}
            </Button>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                Přihlášení probíhá výhradně přes oficiální Discord OAuth.
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                Nikdy po tobě nebudeme chtít heslo ani dvoufázový kód.
              </p>
            </div>

            <FieldDescription className="text-center text-xs text-muted-foreground">
              Pokračováním potvrzuješ souhlas s našimi{" "}
              <Link
                href="https://www.dynastyrp.eu/terms"
                className="underline-offset-4 hover:underline"
              >
                podmínkami používání
              </Link>{" "}a{" "}
              <Link
                href="https://www.dynastyrp.eu/privacy"
                className="underline-offset-4 hover:underline"
              >
                zásadami ochrany soukromí
              </Link>
              .
            </FieldDescription>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Potřebuješ pomoc? Napiš ticket na našem Discordu nebo nás kontaktuj na{" "}
          <a
            href="mailto:support@dynastyrp.eu"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            support@dynastyrp.eu
          </a>
          .
        </div>
      </div>

      <div className="absolute left-6 top-6 hidden items-center gap-3 text-sm text-muted-foreground md:flex">
        <Link
          href="/"
          className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5 backdrop-blur transition-colors hover:border-primary/50 hover:text-foreground"
        >
          ← Zpět na hlavní stránku
        </Link>
      </div>
    </div>
  );
}
