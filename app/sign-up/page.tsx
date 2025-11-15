"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export default function SignUpPage() {
  const registerWithDiscord = async () => {
    try {
      toast.loading("Otevírám Discord registraci...");

      await authClient.signIn.social({
        provider: "discord",
        callbackURL: "/dashboard",
        errorCallbackURL: "/login/error",
      });
    } catch (error) {
      toast.dismiss();
      toast.error("Chyba při přechodu na Discord");
      console.error("Register error:", error);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fff9fb] via-white to-[#fef4f6] px-4 py-16 dark:bg-background">
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2">
        <div className="h-[320px] w-[520px] rounded-full bg-[#b90505]/8 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute right-1/4 bottom-1/4">
        <div className="h-[260px] w-[420px] rounded-full bg-[#b90505]/8 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md space-y-6"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Badge
            variant="outline"
            className="border-[#b90505]/60 bg-[#b90505]/10 px-4 py-1 font-semibold tracking-wide text-[#bd2727] backdrop-blur"
          >
            <Sparkles className="mr-2 h-4 w-4 text-[#bd2727]" />
            Nový hráč
          </Badge>
          <p className="text-sm text-muted-foreground dark:text-gray-300">
            Registrace probíhá přes Discord. Po propojení získáš přístup k whitelistu, dashboardu i komunitním eventům.
          </p>
        </div>

        <Card className="rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_25px_55px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-gradient-to-br dark:from-[#131618] dark:via-[#151a1c] dark:to-[#111b22]">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Vytvoř si účet
            </CardTitle>
            <div className="text-sm text-muted-foreground dark:text-gray-300">
              Připojením Discordu založíš účet i whitelist záznam.
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              onClick={registerWithDiscord}
              className="w-full cursor-pointer border border-slate-200 text-slate-800 hover:bg-slate-50 dark:border-white/20 dark:text-white"
            >
              <Icons.discord className="h-7 w-7 text-[#9b1a1a]" />
              <span className="font-semibold">Pokračovat přes Discord</span>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-slate-600 dark:text-white">
          Už máš účet?{" "}
          <Link href="/sign-in" className="font-semibold text-[#b90505] underline-offset-4 hover:underline">
            Přihlásit se
          </Link>
        </div>

        <div className="text-center text-xs text-slate-500 dark:text-white">
          Registrací souhlasíš s{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-[#b90505]">
            podmínkami služby
          </Link>{" "}
          a{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-[#b90505]">
            zásadami ochrany osobních údajů
          </Link>
          .
        </div>
      </motion.div>
    </div>
  );
}

