"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(true);

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
      <div className="flex flex-col items-start gap-3 p-5 rounded-2xl border border-white/10 shadow-2xl bg-neutral-900/90 backdrop-blur-lg">
        <div className="flex items-center gap-3 mb-1">
          <Cookie className="w-8 h-8 text-[#8a0101] drop-shadow-lg" />
          <div>
            <h4 className="text-base font-semibold text-white">Souhlas s cookies</h4>
            <p className="text-sm text-gray-300 leading-snug">
              Tento web používá cookies, aby Vám zajistil co nejlepší zážitek z našich stránek.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 w-full">
          <Button
            className="cursor-pointer font-semibold px-4 py-2 bg-[#8a0101] hover:bg-[#570000] text-gray-300 hover:text-gray-200 transition-all duration-200 shadow-lg shadow-[#8a0101]/30 ring-2 ring-[#8a0101]/20 hover:ring-[#8a0101]/40"
            onClick={acceptCookies}
          >
            Přijmout
          </Button>
          <Link href="/cookies">
            <Button
              variant="outline"
              className="cursor-pointer border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 font-semibold px-4 py-2 w-full"
              type="button"
            >
              Více informací
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}