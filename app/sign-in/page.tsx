"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GalleryVerticalEnd } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import { toast } from "sonner";

export default function LoginPage() {
  const loginWithDiscord = async () => {
    try {
      toast.loading("Přesměrovávám na Discord...");
      
      await authClient.signIn.social({
        provider: "discord",
        callbackURL: "/dashboard",
        errorCallbackURL: "/login/error",
      });
    } catch (error) {
      toast.dismiss();
      toast.error("Chyba při přihlašování přes Discord");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fff9fb] via-white to-[#fef4f6] px-4 py-16 dark:bg-background">
      
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
        <div className="h-[340px] w-[500px] rounded-full bg-[#b90505]/10 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute left-2/3 bottom-1/8 z-0 -translate-x-1/2">
        <div className="h-[220px] w-[400px] rounded-full bg-[#b90505]/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm flex flex-col gap-6"
      >
        <div className="flex items-center gap-2 self-center font-semibold select-none">
          <Badge
            variant="outline"
            className="border-[#b90505]/60 text-[#bd2727] bg-[#b90505]/10 px-4 py-1 font-semibold tracking-wide backdrop-blur flex gap-2"
          >
            <GalleryVerticalEnd className="h-4 w-4 text-[#bd2727]" />
            Retrovax FiveM
          </Badge>
        </div>

        <Card className="rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_25px_55px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-gradient-to-br dark:from-[#131618] dark:via-[#151a1c] dark:to-[#111b22]">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex justify-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
              Vítej zpět
            </CardTitle>
            <div className="text-sm text-muted-foreground dark:text-gray-300">
              Přihlaš se pomocí Discord účtu, abys mohl začít.
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant={"outline"}
              onClick={loginWithDiscord}
              className="w-full cursor-pointer border border-slate-200 text-slate-800 hover:bg-slate-50 dark:border-white/20 dark:text-white"
            >
              <Icons.discord className="h-7 w-7 text-[#9b1a1a]" />
              <span className="font-semibold dark:text-white">
                Přihlásit se přes Discord
              </span>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-slate-500 drop-shadow-sm dark:text-white [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-150">
          Kliknutím na tlačítko souhlasíte s našimi{" "}
          <Link href="/terms" className="underline">
            Podmínkami služby
          </Link>{" "}
          a{" "}
          <Link href="/privacy" className="underline">
            zásadami ochrany osobních údajů
          </Link>
          .
        </div>
      </motion.div>
    </div>
  );
}