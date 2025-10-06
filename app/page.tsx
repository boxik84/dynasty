"use client";

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Star, Truck, ShoppingBag, Landmark, CreditCard, Home, MapPin, Clock, AlertTriangle, DollarSign, Users, Shield, Code, MessageSquare, Zap, Target, Flame, ChevronRightIcon } from 'lucide-react';
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
  <div className="w-full h-[320px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b90505]"></div>
  </div>
);

// Static data
const features = [
  {
    title: "Autentický Roleplay",
    description: "Ponořte se do realistického světa s propracovaným systémem rolí a interakcí.",
    icon: Users
  },
  {
    title: "Stabilní Prostředí",
    description: "Využíváme nejmodernější technologie pro zajištění plynulého herního zážitku.",
    icon: Shield
  },
  {
    title: "Unikátní Skripty",
    description: "Vlastní herní mechaniky a systémy vytvořené na míru pro náš server.",
    icon: Code
  }
];

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

      <div className="relative mx-auto max-w-7xl flex flex-col items-center justify-center">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center font-bold text-slate-500 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl dark:text-slate-300">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[#b90505]/10 border border-[#b90505]/60 text-[#bd2727] px-4 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
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
          className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-400 mb-8 text-center max-w-xl mt-4 px-4"
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
                className="group px-6 sm:px-8 py-4 sm:py-5 bg-[#8a0101] text-gray-300 font-semibold rounded-xl shadow-xl ring-2 ring-[#b90505]/30 hover:bg-[#570000] hover:text-gray-300 transition duration-200 cursor-pointer hover:ring-[#8a0101] w-full sm:w-auto"
              >
                Připojit se!
                <ChevronRightIcon className="size-4 transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:scale-110" />
              </Button>
          </Link>
          <Link href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="px-6 sm:px-8 py-4 sm:py-5 font-semibold rounded-xl shadow-2xl cursor-pointer ring-2 ring-[#b90505]/40 hover:ring-[#8a0101] transition duration-200 w-full sm:w-auto"
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

const AboutSection = React.memo(() => {
  const serverStats = useMemo(() => [
    { label: "Aktivní hráči", value: "2000+", icon: Users, description: "Denně online" },
    { label: "Roky provozu", value: "3+", icon: Clock, description: "Stabilní provoz" },
    { label: "Unikátní systémy", value: "50+", icon: Code, description: "Vlastní skripty" },
    { label: "Komunitní události", value: "24/7", icon: MessageSquare, description: "Neustálá zábava" },
  ], []);

  return (
    <section className="relative py-32">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b90505]/10 border border-[#b90505]/30 text-[#bd2727] px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-sm mb-6">
            <Shield className="h-4 w-4" />
            O našem serveru
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Retrovax FiveM Experience
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed px-4">
            Více než jen herní server - jsme komunita, kde se rodí nezapomenutelné příběhy. 
            Připojte se k tisícům hráčů v nejautentičtějším roleplay zážitku v České republice a na Slovensku.
          </p>
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {serverStats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center group hover:border-[#b90505]/30 hover:bg-gradient-to-br hover:from-[#b90505]/5 hover:to-[#8a0101]/5 transition-all duration-500">
              <stat.icon className="h-12 w-12 mx-auto mb-4 text-[#bd2727] group-hover:scale-110 transition-transform duration-300" />
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-lg font-semibold text-gray-300 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.description}</div>
            </div>
          ))}
        </motion.div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group relative"
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-md border border-white/20 rounded-3xl p-8 h-full overflow-hidden hover:border-[#b90505]/40 transition-all duration-500">
                
                <div className="absolute inset-0 bg-gradient-to-br from-[#b90505]/5 via-transparent to-[#8a0101]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#b90505]/20 to-[#8a0101]/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-[#bd2727]" />
                </div>
                
                
                <div className="relative text-center">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#bd2727] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>

                
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#b90505] to-[#8a0101] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </motion.div>
          ))}
        </div>

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-[#b90505]/10 via-[#8a0101]/10 to-[#b90505]/10 backdrop-blur-sm border border-[#b90505]/20 rounded-3xl p-10 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">Připraveni vstoupit do hry?</h3>
            <p className="text-gray-400 mb-8 text-lg">Staňte se součástí největší CZ/SK FiveM komunity a začněte psát svůj příběh už dnes</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={siteConfig.links.fivem} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#8a0101] hover:bg-[#570000] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-[#8a0101]/25 transition-all duration-300 text-lg">
                  <Users className="h-5 w-5 mr-2" />
                  Připojit se k serveru
                </Button>
              </Link>
              <Link href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-[#b90505]/40 text-[#bd2727] hover:bg-[#b90505]/10 px-8 py-4 rounded-xl font-semibold transition-all duration-300 text-lg">
                  <Icons.discord className="h-5 w-5 mr-2" />
                  Vstoupit do komunity
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});
AboutSection.displayName = 'AboutSection';

const CommunitySection = React.memo(() => {
  const communityFeatures = [
    {
      icon: MessageSquare,
      title: "Aktivní Discord",
      description: "Přes 15,000 členů v naší Discord komunitě",
      color: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-500/30"
    },
    {
      icon: Users,
      title: "Týmové události",
      description: "Pravidelné komunitní akce a soutěže",
      color: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-500/30"
    },
    {
      icon: Shield,
      title: "24/7 Podpora",
      description: "Náš tým je tu pro vás kdykoliv potřebujete",
      color: "from-purple-500/20 to-purple-600/20",
      borderColor: "border-purple-500/30"
    }
  ];

  return (
    <section className="relative py-32">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b90505]/10 border border-[#b90505]/30 text-[#bd2727] px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-sm mb-6">
            <Users className="h-4 w-4" />
            Naše komunita
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Více než jen server
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
            Jsme rodina hráčů, kteří sdílejí vášeň pro kvalitní roleplay a nezapomenutelné zážitky
          </p>
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {communityFeatures.map((feature, index) => (
            <div key={index} className={cn(
              "bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border rounded-3xl p-8 text-center group hover:scale-105 transition-all duration-500",
              feature.borderColor
            )}>
              <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br mx-auto mb-6 flex items-center justify-center", feature.color)}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});
CommunitySection.displayName = 'CommunitySection';

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
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b90505]/10 border border-[#b90505]/30 text-[#bd2727] px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-sm mb-6">
            <Code className="h-4 w-4" />
            Naši partneři
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Spolupracujeme s nejlepšími
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
            Díky partnerství s předními vývojáři můžeme nabídnout nejkvalitnější herní zážitek
          </p>
        </motion.div>

        <div className="relative flex flex-col text-center">
          <InfiniteSlider gap={100}>
            {partners.map((partner, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#b90505]/30 transition-all duration-300 flex items-center justify-center">
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
      low: { color: 'bg-green-500/20 text-green-300 border-green-500/30', label: riziko },
      medium: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: riziko },
      high: { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: riziko },
      extreme: { color: 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse', label: `🔥 ${riziko}` },
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
    
    if (borderColorClass.includes('green')) {
      return "group-hover:text-green-300 group-hover:bg-green-500/20"; // green
    } else if (borderColorClass.includes('orange')) {
      return "group-hover:text-orange-300 group-hover:bg-orange-500/20"; // orange
    } else if (borderColorClass.includes('red')) {
      return "group-hover:text-red-300 group-hover:bg-red-500/20"; // red
    } else if (borderColorClass.includes('yellow')) {
      return "group-hover:text-yellow-300 group-hover:bg-yellow-500/20"; // yellow
    } else if (borderColorClass.includes('purple')) {
      return "group-hover:text-purple-300 group-hover:bg-purple-500/20"; // purple
    } else if (borderColorClass.includes('blue')) {
      return "group-hover:text-blue-300 group-hover:bg-blue-500/20"; // blue
    } else {
      return "group-hover:text-red-300 group-hover:bg-red-500/20"; // fallback red
    }
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
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b90505]/10 border border-[#b90505]/30 text-[#bd2727] px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-sm mb-6">
            <Zap className="h-4 w-4" />
            Herní aktivity
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Objevte svět možností
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
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
            <div key={index} className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center group hover:border-[#b90505]/30 transition-all duration-300">
              <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
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
                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm",
                selectedCategory === category.id
                  ? "bg-[#b90505]/20 text-[#bd2727] border border-[#b90505]/40 shadow-lg shadow-[#b90505]/20"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
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
                      "group relative overflow-hidden rounded-3xl backdrop-blur-sm border transition-all duration-500 cursor-pointer",
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
                    
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-150 group-hover:duration-150 group-hover:ease-out" />
                    
                    
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-150 group-hover:opacity-90 group-hover:duration-150 group-hover:ease-out" />
                        
                        
                        <div className="absolute top-4 right-4">
                          <Badge className={cn("border font-semibold", riskBadge.color)}>
                            {riskBadge.label}
                          </Badge>
                        </div>
                        
                        
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-black/50 text-white border-white/20">
                            {zakazka.category === 'legal' ? 'Legální' : 
                             zakazka.category === 'illegal' ? 'Ilegální' : 'Loupež'}
                          </Badge>
                        </div>
                      </div>

                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn("p-2 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-150 group-hover:scale-110 group-hover:rotate-3 group-hover:duration-150 group-hover:ease-out", getHoverColor(zakazka).split(' ')[1])}>
                          {zakazka.icon}
                        </div>
                        <h3 className={cn("text-xl font-bold text-white transition-all duration-150 group-hover:translate-x-1 group-hover:duration-150 group-hover:ease-out", getHoverColor(zakazka).split(' ')[0])}>
                          {zakazka.nazev}
                        </h3>
                      </div>

                      
                      <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-grow">
                        {zakazka.popis}
                      </p>

                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm transition-all duration-150 group-hover:translate-x-1 group-hover:duration-150 group-hover:ease-out">
                          <DollarSign className="h-4 w-4 text-green-400 transition-transform duration-150 group-hover:scale-110 group-hover:rotate-12 group-hover:duration-150 group-hover:ease-out" />
                          <span className="text-gray-400">Odměna:</span>
                          <span className="text-green-400 font-semibold group-hover:text-green-300 transition-colors duration-150 group-hover:duration-150 group-hover:ease-out">{zakazka.odmena}</span>
                        </div>
                        
                        {zakazka.vzdalenost && (
                          <div className="flex items-center gap-2 text-sm transition-all duration-150 group-hover:translate-x-1 delay-25 group-hover:duration-150 group-hover:ease-out">
                            <MapPin className="h-4 w-4 text-blue-400 transition-transform duration-150 group-hover:scale-110 group-hover:rotate-12 group-hover:duration-150 group-hover:ease-out" />
                            <span className="text-gray-400">Vzdálenost:</span>
                            <span className="text-blue-400 font-semibold group-hover:text-blue-300 transition-colors duration-150 group-hover:duration-150 group-hover:ease-out">{zakazka.vzdalenost}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm transition-all duration-150 group-hover:translate-x-1 delay-50 group-hover:duration-150 group-hover:ease-out">
                          <Clock className="h-4 w-4 text-yellow-400 transition-transform duration-150 group-hover:scale-110 group-hover:rotate-12 group-hover:duration-150 group-hover:ease-out" />
                          <span className="text-gray-400">Čas:</span>
                          <span className="text-yellow-400 font-semibold group-hover:text-yellow-300 transition-colors duration-150 group-hover:duration-150 group-hover:ease-out">{zakazka.cas}</span>
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
          <div className="bg-gradient-to-r from-[#b90505]/10 via-[#8a0101]/10 to-[#b90505]/10 backdrop-blur-sm border border-[#b90505]/20 rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Připraveni na akci?</h3>
            <p className="text-gray-400 mb-6">Připojte se k tisícům hráčů a začněte svou cestu na Retrovax FiveM</p>
            <Link href={siteConfig.links.fivem} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#8a0101] hover:bg-[#570000] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-[#8a0101]/25 transition-all duration-300">
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
    <div className="mx-auto relative">
      
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] -z-10" />
      
      
      <div className="fixed top-1/4 left-1/4 w-72 h-72 bg-[#b90505]/10 rounded-full blur-2xl animate-pulse -z-10" />
      <div className="fixed top-2/3 right-1/3 w-56 h-56 bg-[#8a0101]/10 rounded-full blur-2xl animate-pulse delay-1000 -z-10" />
      
      
      <HeroSection />
      <AboutSection />
      <CommunitySection />
      <ActivitiesSection />
      <PartnersSection />
    </div>
  );
}