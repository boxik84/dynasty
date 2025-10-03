"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { siteConfig } from '@/config/site';
import { Menu, X } from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
}

const navItems: NavItem[] = [
  { title: "Domů", href: "/" },
  { title: "Dashboard", href: "/dashboard" },
  { title: "Tým", href: "/team" },
  { title: "Žebříček", href: "/statistics" },
];

export function LuxeNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-8 pt-4"
      >
        <div className={cn(
          "max-w-7xl mx-auto transition-all duration-500 rounded-2xl border",
          isScrolled 
            ? "bg-black/60 backdrop-blur-2xl border-white/[0.08] shadow-2xl shadow-black/50" 
            : "bg-black/40 backdrop-blur-xl border-white/[0.05]"
        )}>
          <nav className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              
              {/* Logo */}
              <Link href="/" className="relative group">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Glow on hover */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/0 via-pink-600/0 to-purple-600/0 group-hover:from-purple-600/20 group-hover:via-pink-600/20 group-hover:to-purple-600/20 rounded-2xl blur-xl transition-all duration-500" />
                  
                  <span className="relative text-2xl font-black tracking-tight bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                    DYNASTY RP
                  </span>
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="relative px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    {item.title}
                    
                    {/* Hover indicator */}
                    {hoveredItem === item.href && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-white/5 rounded-lg border border-white/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hidden lg:flex items-center gap-3">
                {/* Discord */}
                <Link
                  href={siteConfig.links.discord}
                  className="group relative px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-lg border border-white/10 group-hover:border-white/20 transition-all duration-300" />
                  <div className="relative flex items-center gap-2">
                    <Icons.discord className="w-4 h-4" />
                    <span>Discord</span>
                  </div>
                </Link>

                {/* Whitelist Button */}
                <Link
                  href="/whitelist"
                  className="group relative px-6 py-2.5 text-sm font-bold text-white overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
                >
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out">
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </div>
                  
                  <span className="relative">Whitelist</span>
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden relative p-2 text-gray-300 hover:text-white transition-colors"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </nav>

          {/* Animated gradient line */}
          {isScrolled && (
            <motion.div
              layoutId="navbar-line"
              className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-24 left-4 right-4 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 lg:hidden overflow-hidden"
            >
              {/* Navigation Links */}
              <div className="p-4 space-y-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                    >
                      {item.title}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* CTA Buttons */}
              <div className="p-4 space-y-2">
                <Link
                  href={siteConfig.links.discord}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <Icons.discord className="w-4 h-4" />
                  Připoj se na Discord
                </Link>

                <Link
                  href="/whitelist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white rounded-lg overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700">
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </div>
                  <span className="relative">Získat Whitelist</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
