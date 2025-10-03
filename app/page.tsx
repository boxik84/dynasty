"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Zap, Shield, Code2, Rocket, Star, TrendingUp, Users, Globe, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Icons } from '@/components/icons';
import { siteConfig } from '@/config/site';
import { CardSpotlight } from '@/components/ui/card-spotlight';

// Animated counter component
const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// Grid pattern background
const GridPattern = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full">
      <div 
        className="absolute h-full w-full opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)'
        }}
      />
    </div>
  );
};

// Dot pattern background
const DotPattern = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.08) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
};

const HeroSection = React.memo(() => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isBadgeHovering, setIsBadgeHovering] = useState(false);

  function handleBadgeMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <GridPattern />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/30 rounded-full mix-blend-normal filter blur-3xl animate-blob" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-pink-600/30 rounded-full mix-blend-normal filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-600/30 rounded-full mix-blend-normal filter blur-3xl animate-blob animation-delay-4000" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Badge with Advanced Spotlight Effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div 
              className="group/badge relative inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-300 hover:border-white/40"
              onMouseMove={handleBadgeMouseMove}
              onMouseEnter={() => setIsBadgeHovering(true)}
              onMouseLeave={() => setIsBadgeHovering(false)}
            >
              {/* Multi-layer gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-950/50 via-pink-950/50 to-blue-950/50" />
              
              {/* Animated gradient orbs */}
              <div className="absolute -left-4 -top-4 h-12 w-12 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
              <div className="absolute -right-4 -bottom-4 h-12 w-12 rounded-full bg-pink-500/20 blur-xl animate-pulse animation-delay-2000" />
              
              {/* Spotlight Effect - follows mouse */}
              <motion.div
                className="pointer-events-none absolute z-0 -inset-px rounded-full opacity-0 transition-opacity duration-500 group-hover/badge:opacity-100"
                style={{
                  background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.6), rgba(236, 72, 153, 0.4), rgba(59, 130, 246, 0.3), transparent 70%)',
                  maskImage: useMotionTemplate`
                    radial-gradient(
                      250px circle at ${mouseX}px ${mouseY}px,
                      white,
                      transparent 70%
                    )
                  `,
                  WebkitMaskImage: useMotionTemplate`
                    radial-gradient(
                      250px circle at ${mouseX}px ${mouseY}px,
                      white,
                      transparent 70%
                    )
                  `,
                }}
              />
              
              {/* Animated mesh gradient overlay */}
              <div className="absolute inset-0 opacity-0 group-hover/badge:opacity-30 transition-opacity duration-500">
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)
                    `,
                    animation: 'moveGradient 8s ease infinite'
                  }}
                />
              </div>
              
              {/* Animated dots pattern */}
              {isBadgeHovering && (
                <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.8) 1px, transparent 0)',
                      backgroundSize: '24px 24px',
                      animation: 'moveBackground 4s linear infinite'
                    }}
                  />
                </div>
              )}

              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover/badge:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Sparkles icon with animation */}
              <div className="relative z-10">
                <Sparkles className="w-4 h-4 text-purple-400 group-hover/badge:text-purple-300 transition-all duration-300 group-hover/badge:scale-110 group-hover/badge:rotate-12" />
              </div>
              
              {/* Text with gradient on hover */}
              <span className="relative z-10 font-semibold bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent group-hover/badge:from-purple-200 group-hover/badge:via-pink-200 group-hover/badge:to-blue-200 transition-all duration-300">
                Vítejte v budoucnosti
              </span>

              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover/badge:from-purple-500/20 group-hover/badge:via-pink-500/20 group-hover/badge:to-blue-500/20 blur-xl transition-all duration-500" />
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight"
          >
            <span className="block text-white">
              Build amazing
            </span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              things faster
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-400 leading-relaxed"
          >
            Moderní platforma pro vytváření webových aplikací s nejnovějšími technologiemi. 
            Rychlé, bezpečné a škálovatelné řešení pro váš projekt.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {/* Primary Button - White with shine effect */}
            <Link 
              href={siteConfig.links.github}
              className="group relative inline-flex items-center justify-center bg-white text-black rounded-full px-8 h-12 text-base font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/20"
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              
              {/* Button content */}
              <span className="relative z-10">Začít zdarma</span>
              <ArrowRight className="relative z-10 ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* Discord Button - Gradient border with glow */}
            <Link 
              href={siteConfig.links.discord}
              className="group relative inline-flex items-center justify-center rounded-full px-8 h-12 text-base font-semibold overflow-hidden transition-all duration-300"
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              <div className="absolute inset-[2px] rounded-full bg-black transition-all duration-300" />
              
              {/* Static border */}
              <div className="absolute inset-0 rounded-full border-2 border-white/30 group-hover:border-transparent transition-colors duration-300" />
              
              {/* Background fill on hover */}
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Button content */}
              <span className="relative z-10 flex items-center text-white">
                <Icons.discord className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                Přidejte se na Discord
              </span>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={2000} suffix="+" />
              </div>
              <div className="text-sm text-gray-400">Uživatelů</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={50} suffix="+" />
              </div>
              <div className="text-sm text-gray-400">Funkcí</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={99} suffix="%" />
              </div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-12 bg-gradient-to-b from-transparent via-gray-500 to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
});
HeroSection.displayName = 'HeroSection';

const BentoGrid = React.memo(() => {
  const features = [
    {
      title: "Lightning Fast",
      description: "Optimalizováno pro maximální výkon a rychlost načítání",
      icon: Zap,
      className: "md:col-span-2 md:row-span-2",
      gradient: "from-yellow-600/20 via-yellow-500/10 to-orange-600/20",
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-400",
      spotlightColors: [[255, 215, 0], [255, 165, 0]] // Gold/Orange
    },
    {
      title: "Secure by Default",
      description: "Bezpečnost na prvním místě s moderními standardy",
      icon: Shield,
      className: "md:col-span-1",
      gradient: "from-green-600/20 via-green-500/10 to-emerald-600/20",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-400",
      spotlightColors: [[34, 197, 94], [16, 185, 129]] // Green/Emerald
    },
    {
      title: "Developer Friendly",
      description: "Jednoduché API a skvělá dokumentace",
      icon: Code2,
      className: "md:col-span-1",
      gradient: "from-blue-600/20 via-blue-500/10 to-cyan-600/20",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      spotlightColors: [[59, 130, 246], [6, 182, 212]] // Blue/Cyan
    },
    {
      title: "Scale Infinitely",
      description: "Připraveno růst s vaším projektem",
      icon: TrendingUp,
      className: "md:col-span-1",
      gradient: "from-purple-600/20 via-purple-500/10 to-pink-600/20",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      spotlightColors: [[139, 92, 246], [236, 72, 153]] // Purple/Pink
    },
    {
      title: "Global Network",
      description: "CDN po celém světě pro rychlé načítání",
      icon: Globe,
      className: "md:col-span-2",
      gradient: "from-indigo-600/20 via-indigo-500/10 to-purple-600/20",
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-400",
      spotlightColors: [[99, 102, 241], [139, 92, 246]] // Indigo/Purple
    },
  ];

  return (
    <section className="relative py-24 bg-black">
      <DotPattern />
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">
              Vše co potřebujete
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Kompletní sada nástrojů pro moderní vývoj webových aplikací
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={feature.className}
            >
              <CardSpotlight
                className="group/card h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5"
                spotlightColors={feature.spotlightColors}
                radius={450}
                color="rgba(255, 255, 255, 0.03)"
              >
                {/* Animated gradient orbs */}
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full opacity-0 group-hover/card:opacity-100 blur-3xl transition-opacity duration-700" 
                     style={{ background: `rgb(${feature.spotlightColors[0].join(', ')})` }} />
                <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full opacity-0 group-hover/card:opacity-100 blur-3xl transition-opacity duration-700" 
                     style={{ background: `rgb(${feature.spotlightColors[1].join(', ')})` }} />
                
                {/* Gradient overlay on hover */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none", feature.gradient)} />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                
                {/* Content */}
                <div className="relative z-10 flex h-full flex-col justify-between p-8">
                  <div>
                    {/* Icon with glow */}
                    <div className="relative inline-flex mb-4">
                      <div className={cn("absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover/card:opacity-50 transition-opacity duration-500", feature.iconBg)} />
                      <div className={cn("relative rounded-2xl p-3 backdrop-blur-sm transition-all duration-300 group-hover/card:scale-110", feature.iconBg)}>
                        <feature.icon className={cn("h-6 w-6 transition-all duration-300", feature.iconColor)} />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover/card:translate-x-1 transition-transform duration-300">{feature.title}</h3>
                    <p className="text-gray-400 group-hover/card:text-gray-300 transition-colors duration-300">{feature.description}</p>
                  </div>
                  
                  {/* Arrow with animation */}
                  <ChevronRight className="h-5 w-5 text-gray-500 self-end opacity-0 group-hover/card:opacity-100 group-hover/card:text-white transition-all duration-300 group-hover/card:translate-x-1" />
                </div>
              </CardSpotlight>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
BentoGrid.displayName = 'BentoGrid';

const FeaturesGrid = React.memo(() => {
  const stats = [
    { 
      label: "Active Users", 
      value: 50000, 
      suffix: "+", 
      color: "text-blue-400",
      spotlightColors: [[59, 130, 246], [96, 165, 250]] // Blue
    },
    { 
      label: "Projects", 
      value: 10000, 
      suffix: "+", 
      color: "text-green-400",
      spotlightColors: [[34, 197, 94], [74, 222, 128]] // Green
    },
    { 
      label: "Uptime", 
      value: 99.9, 
      suffix: "%", 
      color: "text-purple-400",
      spotlightColors: [[139, 92, 246], [168, 85, 247]] // Purple
    },
  ];

  return (
    <section className="relative py-24 bg-black">
      <GridPattern />
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">
              Důvěřují nám tisíce
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Připojte se k rostoucí komunitě vývojářů po celém světě
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CardSpotlight
                className="group/stat overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-10 text-center hover:border-white/20 transition-all duration-500 hover:shadow-2xl"
                spotlightColors={stat.spotlightColors}
                radius={400}
                color="rgba(255, 255, 255, 0.05)"
              >
                {/* Animated gradient orbs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full opacity-0 group-hover/stat:opacity-60 blur-2xl transition-all duration-700" 
                     style={{ background: `rgb(${stat.spotlightColors[0].join(', ')})` }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-24 w-24 rounded-full opacity-0 group-hover/stat:opacity-40 blur-2xl transition-all duration-700 animation-delay-200" 
                     style={{ background: `rgb(${stat.spotlightColors[1].join(', ')})` }} />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-y-full group-hover/stat:translate-y-full transition-transform duration-1000 ease-in-out bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                
                {/* Animated ring */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-3xl" style={{
                    background: `radial-gradient(circle at center, transparent 40%, rgb(${stat.spotlightColors[0].join(', ')} / 0.1) 70%, transparent 100%)`
                  }} />
                </div>
                
                {/* Content */}
                <div className="relative z-10 space-y-2">
                  {/* Number with glow effect */}
                  <div className="relative inline-block">
                    <div className={cn("absolute inset-0 blur-2xl opacity-0 group-hover/stat:opacity-50 transition-opacity duration-500", stat.color)} 
                         style={{ filter: 'blur(30px)' }} />
                    <div className={cn("relative text-5xl md:text-6xl font-bold mb-2 transition-all duration-500 group-hover/stat:scale-110", stat.color)}>
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                  </div>
                  
                  {/* Label with slide up animation */}
                  <div className="text-gray-400 text-lg font-medium group-hover/stat:text-gray-300 transition-all duration-300 group-hover/stat:translate-y-1">
                    {stat.label}
                  </div>
                </div>
              </CardSpotlight>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

const CTASection = React.memo(() => {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl mix-blend-normal" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl mix-blend-normal" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 backdrop-blur-sm p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-blue-600/10" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Připraveni začít?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Přidejte se k tisícům spokojených uživatelů a začněte budovat něco úžasného ještě dnes
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {/* Primary Button - White with shine */}
              <Link 
                href={siteConfig.links.github}
                className="group relative inline-flex items-center justify-center bg-white text-black rounded-full px-8 h-12 font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/20"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                <span className="relative z-10">Vyzkoušet zdarma</span>
                <ArrowRight className="relative z-10 ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              {/* Secondary Button - Gradient border */}
              <Link 
                href={siteConfig.links.discord}
                className="group relative inline-flex items-center justify-center rounded-full px-8 h-12 font-semibold overflow-hidden transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                <div className="absolute inset-[2px] rounded-full bg-black transition-all duration-300" />
                <div className="absolute inset-0 rounded-full border-2 border-white/30 group-hover:border-transparent transition-colors duration-300" />
                <div className="absolute inset-[2px] rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 text-white">Kontaktovat nás</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});
CTASection.displayName = 'CTASection';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Global background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black -z-20" />
      
      <HeroSection />
      <BentoGrid />
      <FeaturesGrid />
      <CTASection />
    </div>
  );
}
