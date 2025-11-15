"use client";
import React, { SVGProps, useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const StickyBanner = ({
  className,
  children,
  hideOnScroll = false,
  ctaHref,
  ctaLabel = "Zjistit víc",
}: {
  className?: string;
  children: React.ReactNode;
  hideOnScroll?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
}) => {
  const [open, setOpen] = useState(true);
  const [visible, setVisible] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (hideOnScroll && latest > 40) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  });

  const handleAnimationComplete = () => {
    if (!open) setVisible(false);
  };

  React.useEffect(() => {
    setOpen(true);
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className={cn(
        "relative inset-x-0 top-0 z-40 flex w-full items-center justify-center px-4 py-3",
        className,
      )}
      initial={{
        y: -100,
        opacity: 0,
        scale: 0.95,
      }}
      animate={{
        y: open ? 0 : -100,
        opacity: open ? 1 : 0,
        scale: open ? 1 : 0.95,
      }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 200,
        damping: 25,
      }}
      onAnimationComplete={handleAnimationComplete}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-rose-200 blur-sm shadow-[0_0_10px_rgba(244,63,94,0.35)] dark:bg-[#8a0101]/40"
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-1 left-1/4 h-3 w-3 rounded-full bg-rose-100 blur-sm shadow-[0_0_8px_rgba(244,63,94,0.35)] dark:bg-[#b90505]/30"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/4 h-2 w-2 rounded-full bg-rose-200 blur-sm shadow-[0_0_6px_rgba(244,63,94,0.3)] dark:bg-[#8a0101]/50"
          animate={{
            opacity: [0.5, 0.9, 0.5],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        <motion.div 
          className="absolute top-1/4 left-1/2 h-1.5 w-1.5 rounded-full bg-rose-300 blur-sm dark:bg-[#570000]/60"
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.7
          }}
        />
      </div>

      
      <div className="relative z-10 w-full max-w-6xl">
        <div className="relative flex w-full flex-col gap-4 rounded-2xl border border-rose-100/80 bg-white/95 px-5 py-4 shadow-[0_24px_65px_rgba(15,23,42,0.08)] dark:border-[#8a0101]/40 dark:bg-[#160404]/85 sm:flex-row sm:items-center sm:gap-6 sm:pr-16">
          <div className="flex flex-1 items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-[#b90505] shadow-[0_12px_25px_rgba(244,63,94,0.3)] ring-2 ring-rose-50 dark:bg-[#8a0101]/30 dark:text-white"
            >
              <StoreIcon className="h-5 w-5" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col text-left"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500 dark:text-rose-200">
                Exkluzivní nabídka
              </p>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                {children}
              </div>
            </motion.div>
          </div>

          {ctaHref && (
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-2xl bg-[#b90505] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200/60 transition-colors duration-200 hover:bg-[#8a0101] dark:shadow-[#8a0101]/30"
            >
              {ctaLabel}
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          )}

          <motion.button
            initial={{
              scale: 0,
              rotate: -90,
            }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              type: "spring",
              stiffness: 200,
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.9,
            }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600 shadow-md transition-colors duration-200 hover:bg-rose-100 dark:border-[#8a0101]/40 dark:bg-[#570000]/40 dark:text-white sm:top-1/2 sm:-translate-y-1/2"
            onClick={() => setOpen(false)}
            aria-label="Zavřít banner"
          >
            <CloseIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const CloseIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
};

const StoreIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <circle cx="12" cy="11" r="1" />
    </svg>
  );
};