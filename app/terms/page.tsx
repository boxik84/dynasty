"use client";

import { motion, useScroll } from "framer-motion";
import { useState, useEffect } from "react";
import { User, BookOpen, Shield, Gavel, AlertCircle, Power, RefreshCw, Mail, CheckCircle, Scale, Users, Calendar, Archive, ArrowUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  const { scrollYProgress } = useScroll();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const keyPoints = [
    {
      icon: User,
      title: "Úvod a souhlas",
      description: "Základní informace o podmínkách služby",
      content: "Vítejte na serveru Retrovax FiveM. Tyto Podmínky služby upravují váš přístup a používání našeho roleplay serveru na platformě FiveM. Používáním serveru souhlasíte s těmito Podmínkami veškerým způsobem.",
      color: "from-blue-500 to-blue-600",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/30"
    },
    {
      icon: Shield,
      title: "Přístup a účty",
      description: "Registrace a zabezpečení účtu",
      content: "Pro přístup na Server je vyžadován účet Discord. Uživatelské jméno a heslo k Discord účtu jsou odpovědností uživatelů, nesete plnou odpovědnost za veškerou aktivitu na Serveru pod vaším účtem.",
      color: "from-green-500 to-green-600",
      iconColor: "text-green-400",
      borderColor: "border-green-500/30"
    },
    {
      icon: Gavel,
      title: "Pravidla chování",
      description: "Povinnosti a zákazy na serveru",
      content: "Respektujte ostatní hráče, dodržujte IC/OOC pravidla a zákaz cheatování. Porušení pravidel může vést k dočasnému nebo trvalému vyloučení ze serveru.",
      color: "from-red-500 to-red-600",
      iconColor: "text-red-400",
      borderColor: "border-red-500/30"
    },
    {
      icon: AlertCircle,
      title: "Duševní vlastnictví",
      description: "Ochrana autorských práv",
      content: "Veškerá práva k obsahu, značkám, logům, skriptům a duševní vlastnictví Serveru patří poskytovateli Retrovax FiveM. Kopírování nebo distribuce bez souhlasu je zakázána.",
      color: "from-orange-500 to-orange-600",
      iconColor: "text-orange-400",
      borderColor: "border-orange-500/30"
    },
    {
      icon: Power,
      title: "Omezení odpovědnosti",
      description: "Podmínky poskytování služby",
      content: "Server je poskytován 'tak, jak je'. Poskytovatel nenese odpovědnost za přerušení služby, ztrátu dat nebo jakékoli škody vzniké používáním serveru.",
      color: "from-purple-500 to-purple-600",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/30"
    },
    {
      icon: RefreshCw,
      title: "Změny podmínek",
      description: "Aktualizace a úpravy pravidel",
      content: "Poskytovatel si vyhrazuje právo kdykoli tyto podmínky změnit. Změny jsou platné dnem zveřejnění na webu. Je povinností uživatelů sledovat aktualizace.",
      color: "from-[#b90505] to-[#bd2727]",
      iconColor: "text-[#bd2727]",
      borderColor: "border-[#b90505]/30"
    }
  ];

  const definitionItems = [
    { 
      term: "Server", 
      definition: "Roleplay server Retrovax FiveM běžící na modifikované infrastruktuře GTA V",
      icon: "🖥️"
    },
    { 
      term: "Uživatel", 
      definition: "Každá osoba, která se připojí nebo používá Server",
      icon: "👤"
    },
    { 
      term: "Obsah", 
      definition: "Jakýkoli text, média, herní data nebo jiný materiál sdílený na Serveru",
      icon: "📋"
    },
    { 
      term: "Pravidla", 
      definition: "Soubor pravidel a pokynů, které řídí chování na Serveru",
      icon: "📜"
    }
  ];

  const behaviorRules = [
    { 
      rule: "Respektujte ostatní hráče – urážky, nenávist, šikana jsou zakázány",
      priority: "high",
      icon: "🚫"
    },
    { 
      rule: "Zákaz cheatování, hackování, exploitů a využívání externích softwarů",
      priority: "high",
      icon: "⚠️"
    },
    { 
      rule: "Dodržujte IC (In Character) a OOC (Out of Character) pravidla",
      priority: "medium",
      icon: "🎭"
    },
    { 
      rule: "Zákaz metagamingu a powergamingu",
      priority: "medium",
      icon: "🎮"
    },
    { 
      rule: "Respektujte rozhodnutí adminů a moderátorů",
      priority: "high",
      icon: "👨‍💼"
    }
  ];

  const detailedSections = [
    {
      id: "termination",
      icon: Archive,
      title: "Ukončení účtu",
      content: "Poskytovatel může dočasně pozastavit nebo trvale zablokovat účet uživatele, který poruší tyto podmínky nebo pravidla serveru. V případě závažného porušení může být účet zablokován okamžitě bez předchozího upozornění.",
      accent: "red"
    },
    {
      id: "liability",
      icon: Scale,
      title: "Rozšířené omezení odpovědnosti",
      content: "Server je poskytován 'tak, jak je' a 'jak je k dispozici'. Poskytovatel nenese odpovědnost za jakékoli přerušení služby, ztrátu herních dat, technické problémy, nebo následné škody vzniklé používáním serveru.",
      accent: "orange"
    },
    {
      id: "contact",
      icon: Mail,
      title: "Kontakt a podpora",
      content: "V případě dotazů ohledně těchto podmínek nebo při problémech se serverem nás kontaktujte prostřednictvím Discord serveru nebo na emailové adrese tobiasvolny@icloud.com. Snažíme se odpovědět do 48 hodin.",
      accent: "blue"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#0a0a0a] dark:via-[#0d0d0d] dark:to-[#0a0a0a]">
      
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b90505] to-[#bd2727] z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      
      <div className="absolute inset-0 pointer-events-none">
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(185,5,5,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(185,5,5,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#b90505]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-[#bd2727]/5 rounded-full blur-3xl" />
        
        
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#b90505]/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto py-20 max-w-7xl">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="flex justify-center mb-8">
              <Badge className="bg-[#b90505]/20 border-[#b90505]/40 text-[#bd2727] px-6 py-3 text-lg font-bold backdrop-blur-xl">
                <Scale className="w-5 h-5 mr-2" />
                Podmínky služby
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                Podmínky služby
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Pravidla a závazky pro všechny uživatele serveru{" "}
              <span className="text-[#bd2727] font-bold">Retrovax FiveM</span>. 
              Seznamte se s podmínkami před použitím našich služeb.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/20 border border-green-500/40 backdrop-blur-xl">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">Platné od 1. ledna 2025</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#b90505]/20 border border-[#b90505]/40 backdrop-blur-xl">
                <Calendar className="w-5 h-5 text-[#bd2727]" />
                <span className="text-[#bd2727] font-medium">Právně závazné</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-blue-500/20 border border-blue-500/40 backdrop-blur-xl">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 font-medium">5 min čtení</span>
              </div>
            </div>
          </motion.div>

          
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {keyPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group"
                  >
                    <Card className="h-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 rounded-3xl overflow-hidden group-hover:bg-white/10">
                      
                      <div className={`h-1 bg-gradient-to-r ${point.color}`} />
                      
                      <CardHeader className="p-8">
                        <div className="flex items-start gap-6">
                          <div className={`p-4 rounded-2xl bg-gradient-to-br ${point.color}/20 ${point.borderColor} border backdrop-blur-sm`}>
                            <Icon className={`w-8 h-8 ${point.iconColor}`} />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-3 transition-colors group-hover:text-[#b90505] dark:group-hover:text-gray-100">
                              {point.title}
                            </CardTitle>
                            <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
                              {point.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="px-8 pb-8">
                        <p className="text-gray-300 leading-relaxed text-lg group-hover:text-gray-200 transition-colors">
                          {point.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-20"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
              
              <CardHeader className="p-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30">
                    <BookOpen className="w-8 h-8 text-blue-400" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                    Definice klíčových pojmů
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {definitionItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + (index * 0.1) }}
                      whileHover={{ scale: 1.02 }}
                      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <h4 className="font-bold text-[#bd2727] text-xl mb-2">
                            {item.term}
                          </h4>
                          <p className="text-gray-300 leading-relaxed">
                            {item.definition}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>

          
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-20"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-500 to-red-600" />
              
              <CardHeader className="p-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30">
                    <Users className="w-8 h-8 text-red-400" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                    Pravidla chování
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 pt-0">
                <div className="space-y-4">
                  {behaviorRules.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + (index * 0.1) }}
                      whileHover={{ scale: 1.01, x: 10 }}
                      className="flex items-start gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-gray-300 leading-relaxed text-lg mb-3">
                          {item.rule}
                        </p>
                        <Badge className={`${
                          item.priority === 'high' 
                            ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                            : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                        } font-medium`}>
                          {item.priority === 'high' ? 'Vysoká priorita' : 'Střední priorita'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>

          
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {detailedSections.map((section, index) => {
                const Icon = section.icon;
                const colors = {
                  red: { gradient: 'from-red-500 to-red-600', bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
                  orange: { gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
                  blue: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' }
                };
                const color = colors[section.accent as keyof typeof colors];

                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 + (index * 0.1) }}
                    whileHover={{ scale: 1.03, y: -10 }}
                  >
                    <Card className="h-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 rounded-3xl overflow-hidden group">
                      <div className={`h-1 bg-gradient-to-r ${color.gradient}`} />
                      
                      <CardHeader className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${color.bg} ${color.border} border`}>
                            <Icon className={`w-6 h-6 ${color.text}`} />
                          </div>
                          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white transition-colors group-hover:text-[#b90505] dark:group-hover:text-gray-100">
                            {section.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6 pt-0">
                        <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                          {section.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-center"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="space-y-4">
                <p className="text-xl text-gray-300 font-medium">
                  Poslední aktualizace: {new Date().toLocaleDateString("cs-CZ")}
                </p>
                <p className="text-gray-400">
                  Tyto podmínky jsou platné pro všechny uživatele serveru{" "}
                  <span className="text-[#bd2727] font-semibold">Retrovax FiveM</span>
                </p>
                <div className="flex items-center justify-center gap-2 pt-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Schváleno právním oddělením</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: showBackToTop ? 1 : 0, 
          scale: showBackToTop ? 1 : 0 
        }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={scrollToTop}
          size="lg"
          className="w-16 h-16 rounded-full bg-[#b90505]/20 hover:bg-[#b90505]/30 border-2 border-[#b90505]/40 hover:border-[#b90505]/60 backdrop-blur-xl shadow-xl transition-all duration-300"
        >
          <ArrowUp className="w-6 h-6 text-[#bd2727]" />
        </Button>
      </motion.div>
    </div>
  );
}