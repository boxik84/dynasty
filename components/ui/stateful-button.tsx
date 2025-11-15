"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { motion, useAnimate } from "motion/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
}

export const Button = ({ className, children, ...props }: ButtonProps) => {
  const [scope, animate] = useAnimate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const animateLoading = async () => {
    await animate(
      ".loader",
      {
        width: "16px",
        scale: 1,
        display: "block",
        opacity: 1,
      },
      {
        duration: 0.3,
        ease: "easeOut",
      },
    );
  };

  const animateSuccess = async () => {
    await animate(
      ".loader",
      {
        width: "0px",
        scale: 0,
        display: "none",
        opacity: 0,
      },
      {
        duration: 0.2,
      },
    );
    await animate(
      ".check",
      {
        width: "16px",
        scale: 1,
        display: "block",
        opacity: 1,
      },
      {
        duration: 0.3,
        ease: "easeOut",
      },
    );

    await animate(
      ".check",
      {
        width: "0px",
        scale: 0,
        display: "none",
        opacity: 0,
      },
      {
        delay: 1.5,
        duration: 0.3,
      },
    );
  };

  const animateError = async () => {
    await animate(
      ".loader",
      {
        width: "0px",
        scale: 0,
        display: "none",
        opacity: 0,
      },
      {
        duration: 0.2,
      },
    );
    await animate(
      ".error",
      {
        width: "16px",
        scale: 1,
        display: "block",
        opacity: 1,
      },
      {
        duration: 0.3,
        ease: "easeOut",
      },
    );

    await animate(
      ".error",
      {
        width: "0px",
        scale: 0,
        display: "none",
        opacity: 0,
      },
      {
        delay: 2,
        duration: 0.3,
      },
    );
  };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || isDisabled) return;
    
    try {
      setIsLoading(true);
      setIsDisabled(true);
    await animateLoading();
      
      if (props.onClick) {
        await props.onClick(event);
      }
      
    await animateSuccess();
    } catch (error) {
      console.error('Button action failed:', error);
      await animateError();
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  };

  const {
    onClick,
    disabled,
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    onAnimationEnd,
    ...buttonProps
  } = props;

  return (
    <motion.button
      layout
      ref={scope}
      className={cn(
        // Base styles matching your design system
        "flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 font-medium text-foreground dark:text-white transition-all duration-200",
        // Default red theme styling
        "border border-[#b90505]/30 bg-transparent hover:bg-[#b90505]/10 text-[#bd2727]",
        // Focus and hover states
        "hover:border-[#b90505]/50 focus:outline-none focus:ring-2 focus:ring-[#b90505]/20",
        // Disabled state
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
        // Loading state
        isLoading && "pointer-events-none",
        className,
      )}
      {...buttonProps}
      disabled={disabled || isDisabled}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <motion.div layout className="flex items-center gap-2">
        <Loader />
        <CheckIcon />
        <ErrorIcon />
        <motion.span layout className="text-inherit">
          {children}
        </motion.span>
      </motion.div>
    </motion.button>
  );
};

const Loader = () => {
  return (
    <motion.svg
      animate={{
        rotate: [0, 360],
      }}
      initial={{
        scale: 0,
        width: 0,
        display: "none",
        opacity: 0,
      }}
      style={{
        scale: 0,
        display: "none",
        opacity: 0,
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "linear",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="loader"
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </motion.svg>
  );
};

const CheckIcon = () => {
  return (
    <motion.svg
      initial={{
        scale: 0,
        width: 0,
        display: "none",
        opacity: 0,
      }}
      style={{
        scale: 0,
        display: "none",
        opacity: 0,
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="check text-green-400"
    >
      <path d="M20 6L9 17l-5-5" />
    </motion.svg>
  );
};

const ErrorIcon = () => {
  return (
    <motion.svg
      initial={{
        scale: 0,
        width: 0,
        display: "none",
        opacity: 0,
      }}
      style={{
        scale: 0,
        display: "none",
        opacity: 0,
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="error text-red-400"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </motion.svg>
  );
};
