"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Shield } from "lucide-react";
import { useTheme } from "next-themes";

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
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

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
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M524.5 133.8C524.3 133.5 524.1 133.2 523.7 133.1C485.6 115.6 445.3 103.1 404 96C403.6 95.9 403.2 96 402.9 96.1C402.6 96.2 402.3 96.5 402.1 96.9C396.6 106.8 391.6 117.1 387.2 127.5C342.6 120.7 297.3 120.7 252.8 127.5C248.3 117 243.3 106.8 237.7 96.9C237.5 96.6 237.2 96.3 236.9 96.1C236.6 95.9 236.2 95.9 235.8 95.9C194.5 103 154.2 115.5 116.1 133C115.8 133.1 115.5 133.4 115.3 133.7C39.1 247.5 18.2 358.6 28.4 468.2C28.4 468.5 28.5 468.7 28.6 469C28.7 469.3 28.9 469.4 29.1 469.6C73.5 502.5 123.1 527.6 175.9 543.8C176.3 543.9 176.7 543.9 177 543.8C177.3 543.7 177.7 543.4 177.9 543.1C189.2 527.7 199.3 511.3 207.9 494.3C208 494.1 208.1 493.8 208.1 493.5C208.1 493.2 208.1 493 208 492.7C207.9 492.4 207.8 492.2 207.6 492.1C207.4 492 207.2 491.8 206.9 491.7C191.1 485.6 175.7 478.3 161 469.8C160.7 469.6 160.5 469.4 160.3 469.2C160.1 469 160 468.6 160 468.3C160 468 160 467.7 160.2 467.4C160.4 467.1 160.5 466.9 160.8 466.7C163.9 464.4 167 462 169.9 459.6C170.2 459.4 170.5 459.2 170.8 459.2C171.1 459.2 171.5 459.2 171.8 459.3C268 503.2 372.2 503.2 467.3 459.3C467.6 459.2 468 459.1 468.3 459.1C468.6 459.1 469 459.3 469.2 459.5C472.1 461.9 475.2 464.4 478.3 466.7C478.5 466.9 478.7 467.1 478.9 467.4C479.1 467.7 479.1 468 479.1 468.3C479.1 468.6 479 468.9 478.8 469.2C478.6 469.5 478.4 469.7 478.2 469.8C463.5 478.4 448.2 485.7 432.3 491.6C432.1 491.7 431.8 491.8 431.6 492C431.4 492.2 431.3 492.4 431.2 492.7C431.1 493 431.1 493.2 431.1 493.5C431.1 493.8 431.2 494 431.3 494.3C440.1 511.3 450.1 527.6 461.3 543.1C461.5 543.4 461.9 543.7 462.2 543.8C462.5 543.9 463 543.9 463.3 543.8C516.2 527.6 565.9 502.5 610.4 469.6C610.6 469.4 610.8 469.2 610.9 469C611 468.8 611.1 468.5 611.1 468.2C623.4 341.4 590.6 231.3 524.2 133.7zM222.5 401.5C193.5 401.5 169.7 374.9 169.7 342.3C169.7 309.7 193.1 283.1 222.5 283.1C252.2 283.1 275.8 309.9 275.3 342.3C275.3 375 251.9 401.5 222.5 401.5zM417.9 401.5C388.9 401.5 365.1 374.9 365.1 342.3C365.1 309.7 388.5 283.1 417.9 283.1C447.6 283.1 471.2 309.9 470.7 342.3C470.7 375 447.5 401.5 417.9 401.5z" />
    </svg>
  );
}

export function AuthScreen({
  redirectTo,
  initialError,
  discordReady,
}: AuthScreenProps) {
  const { theme } = useTheme();
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
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-background via-background to-muted/20">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[5%] top-[15%] size-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-[10%] top-[35%] size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[10%] left-1/2 size-80 -translate-x-1/2 rounded-full bg-muted/20 blur-[120px]" />
      </div>

      {/* Main content */}
      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Card className="w-full border-none p-0 shadow-none">
            <MagicCard
              gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
              className="p-0"
            >
              <CardHeader className="border-border border-b p-6 text-center [.border-b]:pb-6">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    Přihlášení
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Přihlas se přes Discord a pokračuj do Dynasty portálu
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 p-6">
              {displayedError ? (
                <Alert variant="destructive" className="border-destructive/50">
                  <AlertDescription className="text-sm">
                    {displayedError}
                  </AlertDescription>
                </Alert>
              ) : null}

              <Button
                type="button"
                onClick={handleDiscordSignIn}
                disabled={isLoading || !discordReady}
                size="lg"
                className={cn(
                  "group relative flex h-12 w-full items-center justify-center gap-3 rounded-lg",
                  "bg-[#5865F2] text-white shadow-lg transition-all duration-300",
                  "hover:bg-[#4E5BD1] hover:shadow-xl hover:scale-[1.02]",
                  "focus-visible:ring-4 focus-visible:ring-primary/30",
                  "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
                )}
              >
                {isLoading ? (
                  <>
                    <Spinner className="size-5" />
                    <span>Připojuji účet...</span>
                  </>
                ) : (
                  <>
                    <DiscordIcon className="size-5" />
                    <span>Pokračovat přes Discord</span>
                  </>
                )}
              </Button>

              <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="size-3.5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Přihlášení probíhá výhradně přes oficiální Discord OAuth
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="size-3.5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Nikdy po tobě nebudeme chtít heslo ani dvoufázový kód
                  </p>
                </div>
              </div>

              <FieldDescription className="text-center text-xs text-muted-foreground leading-relaxed">
                Pokračováním potvrzuješ souhlas s našimi{" "}
                <Link
                  href="https://www.dynastyrp.eu/terms"
                  className="font-medium text-primary underline-offset-4 hover:underline transition-colors"
                >
                  podmínkami používání
                </Link>{" "}
                a{" "}
                <Link
                  href="https://www.dynastyrp.eu/privacy"
                  className="font-medium text-primary underline-offset-4 hover:underline transition-colors"
                >
                  zásadami ochrany soukromí
                </Link>
                .
              </FieldDescription>
            </CardContent>
            </MagicCard>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Potřebuješ pomoc?{" "}
              <a
                href="mailto:support@dynastyrp.eu"
                className="font-medium text-primary underline-offset-4 hover:underline transition-colors"
              >
                Kontaktuj podporu
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
