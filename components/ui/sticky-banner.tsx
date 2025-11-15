"use client";
import React, { SVGProps, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";

export const StickyBanner = ({
  className,
  children,
  hideOnScroll = false,
}: {
  className?: string;
  children: React.ReactNode;
  hideOnScroll?: boolean;
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
        "inset-x-0 top-0 z-40 flex min-h-16 w-full items-center justify-center px-6 py-3",
        // Enhanced glassmorphism with red brand colors
        "bg-gradient-to-r from-[#8a0101]/20 via-[#570000]/30 to-[#8a0101]/20",
        "backdrop-blur-2xl backdrop-saturate-150",
        // Enhanced borders and shadows with red brand colors
        "border-b border-[#8a0101]/20 shadow-2xl shadow-black/60",
        // Glass effect inner glow with red gradient
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#8a0101]/5 before:via-[#b90505]/10 before:to-[#8a0101]/5 before:pointer-events-none",
        // Animated border glow with stronger red color
        "after:absolute after:inset-x-0 after:bottom-0 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-[#8a0101]/80 after:to-transparent",
        "relative overflow-hidden text-foreground dark:text-white",
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
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-2 -left-2 w-4 h-4 bg-[#8a0101]/40 rounded-full blur-sm shadow-[0_0_10px_#8a0101]"
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
          className="absolute -bottom-1 left-1/4 w-3 h-3 bg-[#b90505]/30 rounded-full blur-sm shadow-[0_0_8px_#b90505]"
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
          className="absolute top-1/2 right-1/4 w-2 h-2 bg-[#8a0101]/50 rounded-full blur-sm shadow-[0_0_6px_#8a0101]"
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
          className="absolute top-1/4 left-1/2 w-1.5 h-1.5 bg-[#570000]/60 rounded-full blur-sm"
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

      
      <div className="flex items-center gap-3 z-10 relative">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#8a0101] via-[#b90505] to-[#570000] rounded-full flex items-center justify-center shadow-lg shadow-[#8a0101]/50 ring-2 ring-[#8a0101]/30"
        >
          <StoreIcon className="w-4 h-4 text-foreground dark:text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          {children}
        </motion.div>
      </div>

      
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
          delay: 0.3,
          type: "spring",
          stiffness: 200,
        }}
        whileHover={{
          scale: 1.1,
          rotate: 90,
          backgroundColor: "rgba(138, 1, 1, 0.3)",
          boxShadow: "0 0 20px rgba(138, 1, 1, 0.4)",
        }}
        whileTap={{
          scale: 0.9,
        }}
        className="absolute top-1/2 right-6 -translate-y-1/2 cursor-pointer bg-[#570000]/20 hover:bg-[#8a0101]/30 transition-all duration-300 rounded-full p-2 shadow-lg border border-[#8a0101]/30 backdrop-blur-sm group ring-1 ring-[#8a0101]/20"
        onClick={() => setOpen(false)}
        aria-label="Zavřít banner"
      >
        <CloseIcon className="h-5 w-5 text-foreground dark:text-white/80 group-hover:text-foreground dark:text-white transition-colors duration-200 drop-shadow-sm" />
      </motion.button>
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