"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const isCookieAccepted = localStorage.getItem("cookieAccepted");
    if (isCookieAccepted) setIsVisible(false);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieAccepted", "true");
    toast.success("Cookies byly přijaty", {
      description: "Děkujeme za souhlas s používáním cookies"
    });
    setIsVisible(false);
  };

  // Opravené variants (žádné pointerEvents)
  const variants = {
    open: { opacity: 1, y: 0 },
    closed: { opacity: 0, y: 50 },
  };

  return (
    <motion.div
      initial="closed"
      animate={isVisible ? "open" : "closed"}
      variants={variants}
      transition={{ type: "spring", bounce: 0.24, duration: 0.62 }}
      className="fixed bottom-7 right-7 z-50 w-full max-w-xs md:max-w-md pointer-events-auto"
      id="v6e8d8hdlc"
    >
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-5 text-slate-900 shadow-[0px_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-lg dark:border-white/10 dark:bg-neutral-900/90 dark:text-white">
        <div className="flex items-center gap-3 mb-1">
          <Cookie className="h-8 w-8 text-[#b90505] drop-shadow-[0_0_12px_rgba(185,5,5,0.25)] dark:text-[#8a0101]" />
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">Souhlas s cookies</h4>
            <p className="text-sm leading-snug text-muted-foreground dark:text-gray-300">
              Tento web používá cookies, aby Vám zajistil co nejlepší zážitek z našich stránek.
            </p>
          </div>
        </div>
        <div className="mt-2 flex w-full items-center gap-2">
          <Button
            className="cursor-pointer rounded-xl border border-transparent bg-[#b90505] px-4 py-2 font-semibold text-white shadow-lg shadow-rose-200/70 transition-colors duration-200 hover:bg-[#8a0101] focus-visible:ring-[#b90505]/30 dark:bg-[#8a0101] dark:text-white"
            onClick={acceptCookies}
          >
            Přijmout
          </Button>
          <Button
            variant="outline"
            className="w-full cursor-pointer rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-900 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white"
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? "Skrýt detaily" : "Více informací"}
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              className="w-full overflow-hidden"
            >
              <div className="mt-3 w-full rounded-2xl border border-rose-100/60 bg-rose-50/80 p-4 text-sm text-slate-700 shadow-inner dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-rose-500 dark:text-rose-200">
                  Transparentní používání
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex gap-2">
                    <span className="h-1.5 w-1.5 translate-y-2 rounded-full bg-[#b90505]" />
                    Používáme pouze nezbytné a analytické cookies pro bezpečnost a stabilitu.
                  </li>
                  <li className="flex gap-2">
                    <span className="h-1.5 w-1.5 translate-y-2 rounded-full bg-[#b90505]" />
                    Vaše nastavení ukládáme lokálně, aby se banner nezobrazoval opakovaně.
                  </li>
                  <li className="flex gap-2">
                    <span className="h-1.5 w-1.5 translate-y-2 rounded-full bg-[#b90505]" />
                    Detailní rozpis cookies najdete v plné dokumentaci.
                  </li>
                </ul>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground dark:text-gray-400">
                    Spravujte předvolby v nastavení prohlížeče kdykoliv.
                  </span>
                  <Link href="/cookies" className="shrink-0">
                    <Button variant="ghost" size="sm" className="text-[#b90505] hover:text-[#8a0101] dark:text-rose-200">
                      Celé zásady
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}