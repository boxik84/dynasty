"use client";

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Star, Truck, ShoppingBag, Landmark, CreditCard, Home, MapPin, Clock, AlertTriangle, DollarSign, Shield, Code, Zap, Target, Flame, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { InfiniteSlider } from '@/components/motion-primitives/infinite-slider';
import { Icons } from '@/components/icons';

// Lazy load heavy components
const Particles = lazy(() => import('@/components/magicui/particles').then(mod => ({ default: mod.Particles })));
const HeroVideoDialog = lazy(() => import('@/components/magicui/hero-video-dialog'));

// Loading components
const ParticlesLoader = () => <div className="absolute inset-0 bg-transparent min-h-[400px]" />;
const VideoLoader = () => (
  <div className="w-full h-[320px] rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:border-gray-700 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#b90505]" />
  </div>
);

// Static data
const zakazky = [
  {
    nazev: 'Kamionová přeprava',
    popis: 'Přepravujte různé druhy nákladu mezi sklady po celém městě. Odměna se vypočítává podle uražené vzdálenosti.',
    obrazek: '/aktivity/kamion.png',
    icon: <Truck className="h-5 w-5 text-green-400" />,
    odmena: '187 – 784',
    vzdalenost: '1.9 – 7.8 km',
    cas: 'Záleží na trase',
    riziko: 'Žádné (Legální Aktivita)',
    rizikoLevel: 'low',
    category: 'legal',
    span: 1,
    gradient: 'from-green-500/20 via-emerald-500/10 to-green-600/20',
    borderColor: 'border-green-500/30',
    glowColor: 'shadow-green-500/20',
  },
  {
    nazev: 'Vloupačka do domu',
    popis: 'Vykradení soukromých domů. Vyžaduje lockpick a trvá 5 min. Po skončení se dveře automaticky zamknou.',
    obrazek: '/aktivity/robhouse.png',
    icon: <Home className="h-5 w-5 text-orange-400" />,
    odmena: 'Různé položky (peníze, šperky, zbraně)',
    cas: 'Max. 5 min',
    riziko: 'Vysoké',
    rizikoLevel: 'high',
    category: 'illegal',
    span: 1,
    gradient: 'from-orange-500/20 via-amber-500/10 to-orange-600/20',
    borderColor: 'border-orange-500/30',
    glowColor: 'shadow-orange-500/20',
  },
  {
    nazev: 'Krádež vozidla s lokátorem',
    popis: 'Vozidlo je označeno GPS lokátorem. Nejprve hackněte zařízení, poté doručte auto do vyznačeného místa do 20 min, jinak odměna propadne.',
    obrazek: '/aktivity/lokator.png',
    icon: <Target className="h-5 w-5 text-red-400" />,
    odmena: '2,000 – 16,000',
    cas: '20 min',
    riziko: 'Vysoké',
    rizikoLevel: 'high',
    category: 'illegal',
    span: 1,
    gradient: 'from-red-500/20 via-rose-500/10 to-red-600/20',
    borderColor: 'border-red-500/30',
    glowColor: 'shadow-red-500/20',
  },
  {
    nazev: 'Loupež klenotnictví',
    popis: 'Vykrádež vitrín v klenotnictví. Vyžaduje vyšší počet policistů pro vyváženou ekonomiku a alarm trvá 2 min.',
    obrazek: '/aktivity/kleno.png',
    icon: <Star className="h-5 w-5 text-yellow-400" />,
    odmena: '3 - 7 exkluzivních klenotů v každé sekci',
    cas: 'Max. 20 min',
    riziko: "Extrémní",
    rizikoLevel: 'extreme',
    category: 'heist',
    span: 2,
    gradient: 'from-yellow-500/20 via-amber-500/10 to-yellow-600/20',
    borderColor: 'border-yellow-500/30',
    glowColor: 'shadow-yellow-500/20',
  },
  {
    nazev: 'Přepadení prodejny',
    popis: 'Vniknutí do kamenné prodejny (elektro, oděvy či stánek s alkoholem). Akce trvá maximálně 10 minut, bezpečnostní zámek se aktivuje za 40 s.',
    obrazek: '/aktivity/robshop.png',
    icon: <ShoppingBag className="h-5 w-5 text-purple-400" />,
    odmena: '500 – 850 za zásah',
    cas: 'až 10 min',
    riziko: 'střední',
    rizikoLevel: 'medium',
    category: 'illegal',
    span: 1,
    gradient: 'from-purple-500/20 via-violet-500/10 to-purple-600/20',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/20',
  },
  {
    nazev: 'Loupež bankomatu',
    popis: 'Hacking nebo odpálení bankomatu. Zpráva o výbuchu spustí dispatch. ATM se obnoví po 10 min.',
    obrazek: '/aktivity/robatm.png',
    icon: <CreditCard className="h-5 w-5 text-blue-400" />,
    odmena: '150 – 250',
    cas: '5 – 10 min',
    riziko: 'Střední',
    rizikoLevel: 'medium',
    category: 'illegal',
    span: 1,
    gradient: 'from-blue-500/20 via-cyan-500/10 to-blue-600/20',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20',
  },
  {
    nazev: 'Loupež banky',
    popis: 'Vykradení bankomatu nebo trezoru v bance. Vyžaduje přístupový čip, trvá až 60 min.',
    obrazek: '/aktivity/robbank.png',
    icon: <Landmark className="h-5 w-5 text-red-500" />,
    odmena: '800 × 40 pauz',
    cas: 'Max. 60 min',
    riziko: "Extrémní",
    rizikoLevel: 'extreme',
    category: 'heist',
    span: 2,
    gradient: 'from-red-600/30 via-rose-600/20 to-red-700/30',
    borderColor: 'border-red-600/40',
    glowColor: 'shadow-red-600/30',
  },
];

// Activity stats for overview
const activityStats = [
  { label: "Legální aktivity", value: "1", icon: Shield, color: "text-green-400" },
  { label: "Ilegální aktivity", value: "4", icon: AlertTriangle, color: "text-orange-400" },
  { label: "Velké loupeže", value: "2", icon: Flame, color: "text-red-400" },
  { label: "Celkem aktivit", value: "7+", icon: Zap, color: "text-blue-400" },
];

const glassCardClass =
  "rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)]";

const glassTileClass =
  "rounded-2xl border border-slate-200 bg-white/95 shadow-md shadow-slate-200/60 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.08] dark:shadow-black/40";

const headingGradientClass =
  "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent dark:from-white dark:via-gray-200 dark:to-gray-400";

const pillClass =
  "inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50/80 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm backdrop-blur-sm dark:border-[#b90505]/40 dark:bg-[#b90505]/10 dark:text-[#bd2727]";

// Optimized components with memoization
const HeroSection = React.memo(() => {
  const { resolvedTheme } = useTheme();
  const words = useMemo(() => "Vítej na portálu Retrovax FiveM".split(" "), []);

  return (
    <section className="relative">
      <Suspense fallback={<ParticlesLoader />}>
        <Particles className="absolute inset-0" quantity={100} ease={80} color={resolvedTheme === "dark" ? "#ffffff" : "#000000"} refresh />
      </Suspense>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/6 w-full bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/6 w-full bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl dark:text-slate-100">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <span className={cn(pillClass, "text-xs py-1")}>
              <svg width="14" height="14" fill="none"><circle cx="7" cy="7" r="7" fill="#b90505" /></svg>
              Největší cz/sk FiveM server
            </span>
          </motion.div>
          {words.map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1, ease: "easeInOut" }}
              className="mr-2 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-4 mb-8 max-w-xl px-4 text-center text-sm font-medium text-muted-foreground sm:text-base md:text-lg lg:text-xl dark:text-gray-400"
        >
          Naše komunita je postavena na principech spolupráce, respektu a zábavy. Přidej se k nám a zažij autentický herní zážitek v prostředí, které jsme vytvořili s láskou a péčí.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 px-4"
        >
          <Link href={siteConfig.links.fivem} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="group w-full rounded-xl bg-[#b90505] px-6 py-4 font-semibold text-white shadow-xl shadow-rose-200/60 ring-2 ring-[#b90505]/20 transition duration-200 hover:bg-[#8a0101] hover:ring-[#8a0101]/40 sm:w-auto sm:px-8 sm:py-5 dark:shadow-[#b90505]/25"
              >
                Připojit se!
                <ChevronRightIcon className="size-4 transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:scale-110" />
              </Button>
          </Link>
          <Link href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-xl px-6 py-4 font-semibold text-[#8a0101] ring-1 ring-[#b90505]/30 transition duration-200 hover:bg-rose-50 hover:text-[#8a0101] sm:w-auto sm:px-8 sm:py-5 dark:text-gray-100 dark:hover:bg-white/10 dark:ring-[#b90505]/40"
              >
                <Icons.discord className="h-5 w-5 mr-2" />
                Discord
              </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="relative z-10 mt-20 rounded-3xl border border-neutral-200 bg-neutral-100 p-2 sm:p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900 w-full max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-6xl mx-4 min-h-[340px]"
        >
          <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700 min-h-[320px] relative">
            <Suspense fallback={<VideoLoader />}>
              <HeroVideoDialog
                animationStyle="from-center"
                videoSrc="https://www.youtube.com/embed/QPkiKHcdKN8?si=NSddYlnOpvBSVZbw"
                thumbnailSrc="/TEASER.jpg"
                thumbnailAlt="Teaser"
              />
            </Suspense>
          </div>
        </motion.div>
      </div>
    </section>
  );
});
HeroSection.displayName = 'HeroSection';


const PartnersSection = React.memo(() => {
  const partners = [
    { src: "/devs/GOTTI_LOGO.png", alt: "Gotti Logo" },
    { src: "/devs/gabz-logo.png", alt: "Gabz Logo" },
    { src: "/devs/brofx-logo.png", alt: "BrofX Logo" },
    { src: "/devs/lb-scripts.png", alt: "LB Scripts Logo" },
    { src: "/devs/jg-scripts-logo.png", alt: "JG Scripts Logo" },
    { src: "/devs/drc-scripts.png", alt: "DRC Scripts logo" },
    { src: "/devs/wasabi-logo.png", alt: "Wasabi Scripts logo" },
  ];

  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className={cn(pillClass, "mb-6")}>
            <Code className="h-4 w-4 text-rose-600 dark:text-white" />
            Naši partneři
          </div>
          <h2 className={cn(headingGradientClass, "mb-6")}>
            Spolupracujeme s nejlepšími
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
            Díky partnerství s předními vývojáři můžeme nabídnout nejkvalitnější herní zážitek
          </p>
        </motion.div>

        <div className="relative flex flex-col text-center">
          <InfiniteSlider gap={100}>
            {partners.map((partner, index) => (
              <div
                key={index}
                className={cn(
                  glassTileClass,
                  "flex items-center justify-center rounded-2xl p-6 transition-all duration-300 hover:border-[#b90505]/40"
                )}
              >
                <div className="relative h-[80px] w-[120px] flex items-center justify-center">
                  <Image
                    src={partner.src}
                    alt={partner.alt}
                    fill
                    className="object-contain transition-transform duration-300 hover:scale-105 mx-auto"
                    priority={index < 2}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 120px"
                  />
                </div>
              </div>
            ))}
          </InfiniteSlider>

          <div className="pointer-events-none absolute inset-y-0 left-0 h-full w-1/6 bg-gradient-to-r from-background" />
          <div className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/6 bg-gradient-to-l from-background" />
        </div>
      </div>
    </section>
  );
});
PartnersSection.displayName = 'PartnersSection';

const ActivitiesSection = React.memo(() => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Všechny aktivity', icon: Zap },
    { id: 'legal', label: 'Legální', icon: Shield },
    { id: 'illegal', label: 'Ilegální', icon: AlertTriangle },
    { id: 'heist', label: 'Velké loupeže', icon: Flame },
  ];

  const filteredActivities = selectedCategory === 'all' 
    ? zakazky 
    : zakazky.filter(activity => activity.category === selectedCategory);

  const getRiskBadge = (riskLevel: string, riziko: string) => {
    const badges = {
      low: {
        color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-200 dark:border-green-500/40",
        label: riziko,
      },
      medium: {
        color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-yellow-500/20 dark:text-yellow-200 dark:border-yellow-500/40",
        label: riziko,
      },
      high: {
        color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-200 dark:border-orange-500/40",
        label: riziko,
      },
      extreme: {
        color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-200 dark:border-red-500/40 animate-pulse",
        label: `🔥 ${riziko}`,
      },
    };
    return badges[riskLevel as keyof typeof badges] || badges.medium;
  };

  const getShadowColor = (zakazka: any) => {
    // Extract color from borderColor class
    const borderColorClass = zakazka.borderColor;
    
    if (borderColorClass.includes('green')) {
      return "rgba(34, 197, 94, 0.4)"; // green-500
    } else if (borderColorClass.includes('orange')) {
      return "rgba(249, 115, 22, 0.4)"; // orange-500
    } else if (borderColorClass.includes('red')) {
      return "rgba(239, 68, 68, 0.4)"; // red-500
    } else if (borderColorClass.includes('yellow')) {
      return "rgba(234, 179, 8, 0.4)"; // yellow-500
    } else if (borderColorClass.includes('purple')) {
      return "rgba(168, 85, 247, 0.4)"; // purple-500
    } else if (borderColorClass.includes('blue')) {
      return "rgba(59, 130, 246, 0.4)"; // blue-500
    } else {
      return "rgba(185, 5, 5, 0.4)"; // fallback red
    }
  };

  const getHoverColor = (zakazka: any) => {
    // Extract color from borderColor class for hover effects
    const borderColorClass = zakazka.borderColor;

    const map = {
      green: {
        textHover: "group-hover:text-green-600 dark:group-hover:text-green-200",
        bgHover: "group-hover:bg-green-100 dark:group-hover:bg-green-500/20",
      },
      orange: {
        textHover: "group-hover:text-orange-600 dark:group-hover:text-orange-200",
        bgHover: "group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20",
      },
      red: {
        textHover: "group-hover:text-red-600 dark:group-hover:text-red-200",
        bgHover: "group-hover:bg-red-100 dark:group-hover:bg-red-500/20",
      },
      yellow: {
        textHover: "group-hover:text-yellow-600 dark:group-hover:text-yellow-200",
        bgHover: "group-hover:bg-yellow-100 dark:group-hover:bg-yellow-500/20",
      },
      purple: {
        textHover: "group-hover:text-purple-600 dark:group-hover:text-purple-200",
        bgHover: "group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20",
      },
      blue: {
        textHover: "group-hover:text-blue-600 dark:group-hover:text-blue-200",
        bgHover: "group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20",
      },
    };

    const found = (Object.keys(map) as Array<keyof typeof map>).find((key) =>
      borderColorClass.includes(key),
    );

    return found ? map[found] : map.red;
  };

  return (
    <section className="relative py-24 mt-16">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className={cn(pillClass, "mb-6")}>
            <Zap className="h-4 w-4 text-rose-600 dark:text-white" />
            Herní aktivity
          </div>
          <h2 className={cn(headingGradientClass, "mb-6")}>
            Objevte svět možností
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
            Od legálních prací až po rizikové loupeže - každý si najde svou cestu k bohatství
          </p>
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {activityStats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                glassTileClass,
                "group rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#b90505]/40"
              )}
            >
              <stat.icon className={`mx-auto mb-3 h-8 w-8 ${stat.color} transition-transform duration-300 group-hover:scale-110`} />
              <div className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-muted-foreground dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all duration-300",
                selectedCategory === category.id
                  ? "border border-rose-200 bg-rose-100 text-rose-700 shadow-lg shadow-rose-200/70 dark:border-[#b90505]/40 dark:bg-[#b90505]/20 dark:text-[#bd2727]"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              )}
            >
              <category.icon className="h-4 w-4" />
              {category.label}
            </button>
          ))}
        </motion.div>

        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {filteredActivities.map((zakazka, i) => {
                const riskBadge = getRiskBadge(zakazka.rizikoLevel, zakazka.riziko);
                const hoverColors = getHoverColor(zakazka);
                
                return (
                  <motion.div
                    key={`${selectedCategory}-${i}`}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      y: -4,
                      transition: { duration: 0.15, ease: "easeOut" }
                    }}
                    whileTap={{ 
                      scale: 1.01,
                      y: -2,
                      transition: { duration: 0.1, ease: "easeOut" }
                    }}
                    className={cn(
                      glassCardClass,
                      "group relative cursor-pointer overflow-hidden transition-all duration-500",
                      zakazka.borderColor,
                      zakazka.glowColor,
                      zakazka.span === 2 ? "lg:col-span-2" : ""
                    )}
                    style={{
                      transition: "all 0.15s ease-out, box-shadow 0.15s ease-out"
                    }}
                    onMouseEnter={(e) => {
                      const shadowColor = getShadowColor(zakazka);
                      const borderColor = shadowColor.replace('0.4)', '0.6)');
                      e.currentTarget.style.boxShadow = `0 15px 30px ${shadowColor}, 0 0 0 1px ${borderColor}`;
                      e.currentTarget.style.transition = "all 0.15s ease-out, box-shadow 0.15s ease-out";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 0 0 0 rgba(0, 0, 0, 0)";
                      e.currentTarget.style.transition = "all 0.1s ease-out, box-shadow 0.1s ease-out";
                    }}
                  >
                    
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity duration-150 group-hover:opacity-70 group-hover:duration-150 group-hover:ease-out", zakazka.gradient)} />
                    
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-transparent opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:duration-150 group-hover:ease-out dark:from-white/[0.12]" />
                    
                    
                    <div className="relative p-6 h-full flex flex-col">
                      
                      <div className="relative h-48 w-full mb-6 rounded-2xl overflow-hidden group-hover:rounded-3xl transition-all duration-150 group-hover:duration-150 group-hover:ease-out">
                        <Image
                          src={zakazka.obrazek}
                          alt={zakazka.nazev}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={i < 2}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-150 group-hover:opacity-90 group-hover:duration-150 group-hover:ease-out dark:from-black/80" />
                        
                        
                        <div className="absolute top-4 right-4">
                          <Badge className={cn("border font-semibold", riskBadge.color)}>
                            {riskBadge.label}
                          </Badge>
                        </div>
                        
                        
                        <div className="absolute top-4 left-4">
                          <Badge className="border border-slate-200 bg-white/80 text-slate-800 dark:border-white/20 dark:bg-black/50 dark:text-white">
                            {zakazka.category === 'legal' ? 'Legální' : 
                             zakazka.category === 'illegal' ? 'Ilegální' : 'Loupež'}
                          </Badge>
                        </div>
                      </div>

                      
                      <div className="mb-4 flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg bg-rose-50 text-rose-600 transition-all duration-150 group-hover:scale-110 group-hover:rotate-3 group-hover:duration-150 group-hover:ease-out dark:bg-white/10 dark:text-white", hoverColors.bgHover)}>
                          {zakazka.icon}
                        </div>
                        <h3 className={cn("text-xl font-bold text-slate-900 transition-all duration-150 group-hover:translate-x-1 group-hover:duration-150 group-hover:ease-out dark:text-white", hoverColors.textHover)}>
                          {zakazka.nazev}
                        </h3>
                      </div>

                      
                      <p className="mb-6 flex-grow text-sm leading-relaxed text-muted-foreground dark:text-gray-300">
                        {zakazka.popis}
                      </p>

                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm transition-all duration-150 group-hover:translate-x-1 group-hover:duration-150 group-hover:ease-out">
                          <DollarSign className="h-4 w-4 text-green-400 transition-transform duration-150 group-hover:scale-110 group-hover:rotate-12 group-hover:duration-150 group-hover:ease-out" />
                          <span className="text-muted-foreground dark:text-gray-400">Odměna:</span>
                          <span className="font-semibold text-green-600 transition-colors duration-150 group-hover:text-green-500 group-hover:duration-150 group-hover:ease-out dark:text-green-400">{zakazka.odmena}</span>
                        </div>
                        
                        {zakazka.vzdalenost && (
                          <div className="flex items-center gap-2 text-sm transition-all duration-150 delay-25 group-hover:translate-x-1 group-hover:duration-150 group-hover:ease-out">
                            <MapPin className="h-4 w-4 text-blue-400 transition-transform duration-150 group-hover:scale-110 group-hover:rotate-12 group-hover:duration-150 group-hover:ease-out" />
                            <span className="text-muted-foreground dark:text-gray-400">Vzdálenost:</span>
                            <span className="font-semibold text-blue-600 transition-colors duration-150 group-hover:text-blue-500 group-hover:duration-150 group-hover:ease-out dark:text-blue-300">{zakazka.vzdalenost}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm transition-all duration-150 delay-50 group-hover:translate-x-1 group-hover:duration-150 group-hover:ease-out">
                          <Clock className="h-4 w-4 text-yellow-400 transition-transform duration-150 group-hover:scale-110 group-hover:rotate-12 group-hover:duration-150 group-hover:ease-out" />
                          <span className="text-muted-foreground dark:text-gray-400">Čas:</span>
                          <span className="font-semibold text-yellow-600 transition-colors duration-150 group-hover:text-yellow-500 group-hover:duration-150 group-hover:ease-out dark:text-yellow-300">{zakazka.cas}</span>
                        </div>
                      </div>

                      
                      
                      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-[#b90505]/20 opacity-0 group-hover:opacity-100 transition-all duration-150 delay-75 group-hover:duration-150 group-hover:ease-out" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="mx-auto max-w-2xl rounded-3xl border border-rose-100/70 bg-gradient-to-r from-rose-100 via-rose-50 to-amber-50 p-8 shadow-[0_18px_40px_rgba(244,114,182,0.2)] dark:border-[#b90505]/20 dark:from-[#b90505]/10 dark:via-[#8a0101]/10 dark:to-[#b90505]/10">
            <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Připraveni na akci?</h3>
            <p className="mb-6 text-muted-foreground dark:text-gray-400">Připojte se k tisícům hráčů a začněte svou cestu na Retrovax FiveM</p>
            <Link href={siteConfig.links.fivem} target="_blank" rel="noopener noreferrer">
              <Button className="rounded-xl bg-[#b90505] px-8 py-3 font-semibold text-white shadow-lg shadow-rose-200/60 transition-all duration-300 hover:bg-[#8a0101] hover:shadow-rose-300/40 dark:shadow-[#b90505]/25">
                <Zap className="h-5 w-5 mr-2" />
                Připojit se nyní
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
});
ActivitiesSection.displayName = 'ActivitiesSection';

export default function HomePage() {
  return (
    <div className="relative mx-auto">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0a0a0a] dark:via-[#0d0d0d] dark:to-[#0a0a0a]" />
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-rose-200/50 blur-3xl dark:bg-[#b90505]/10" />
        <div className="absolute top-2/3 right-1/3 h-56 w-56 rounded-full bg-rose-100/50 blur-3xl dark:bg-[#8a0101]/10" />
      </div>

      <HeroSection />
      <ActivitiesSection />
      <PartnersSection />
    </div>
  );
}