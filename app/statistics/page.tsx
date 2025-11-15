"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, Car, Users, Clock, ShieldCheck, TrendingUp, BarChart3, FileText } from "lucide-react";
import CountUp from '@/components/count-up';
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Statistics {
  totalCharacters: number;
  totalMoney: number;
  totalVehicles: number;
  totalDiscordMembers: number;
  totalWhitelisted: number;
  totalWhitelistRequests: number;
  approvedWhitelistRequests: number;
  daysRunning: number;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics>({
    totalCharacters: 0,
    totalMoney: 0,
    totalVehicles: 0,
    totalDiscordMembers: 0,
    totalWhitelisted: 0,
    totalWhitelistRequests: 0,
    approvedWhitelistRequests: 0,
    daysRunning: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        toast.loading("Načítám statistiky serveru...");
        const res = await fetch("/api/statistics", { cache: "no-store" });
        const data = await res.json();
        
        if (res.ok) {
          setStats(data);
          toast.dismiss();
          toast.success("Statistiky úspěšně načteny");
        } else {
          toast.dismiss();
          toast.error("Chyba při načítání statistik");
        }
      } catch (error) {
        console.error("Chyba při načítání statistik:", error);
        toast.dismiss();
        toast.error("Nastala chyba při načítání statistik");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsItems = [
    {
      icon: User,
      title: "Celkem postav",
      value: stats.totalCharacters,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/30",
      description: "Aktivní postavy na serveru"
    },
    {
      icon: CreditCard,
      title: "Peněz v oběhu",
      value: stats.totalMoney,
      prefix: "$",
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      borderColor: "border-green-400/30",
      description: "Celková hotovost hráčů"
    },
    {
      icon: Car,
      title: "Vozidel",
      value: stats.totalVehicles,
      color: "text-red-400",
      bgColor: "bg-red-400/10",
      borderColor: "border-red-400/30",
      description: "Zakoupená vozidla"
    },
    {
      icon: Users,
      title: "Discord členů",
      value: stats.totalDiscordMembers,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/30",
      description: "Členové komunity"
    },
    {
      icon: ShieldCheck,
      title: "Whitelist hráčů",
      value: stats.totalWhitelisted,
      color: "text-[#8a0101]",
      bgColor: "bg-[#8a0101]/10",
      borderColor: "border-[#8a0101]/30",
      description: "Schválení hráči"
    },
    {
      icon: Clock,
      title: "Dní online",
      value: stats.daysRunning,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
      borderColor: "border-orange-400/30",
      description: "Od spuštění serveru"
    }
  ];

  // Vypočítání úspěšnosti whitelistu
  const whitelistSuccessRate = stats.totalWhitelistRequests > 0 
    ? Math.round((stats.approvedWhitelistRequests / stats.totalWhitelistRequests) * 100)
    : 0;

  const whitelistStatsItems = [
    {
      icon: FileText,
      title: "Whitelist žádostí",
      value: stats.totalWhitelistRequests,
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
      borderColor: "border-cyan-400/30",
      description: "Celkem odeslaných formulářů"
    },
    {
      icon: TrendingUp,
      title: "Úspěšnost",
      value: whitelistSuccessRate,
      suffix: "%",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/30",
      description: "Procento schválených žádostí"
    }
  ];

  return (
    <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a] overflow-hidden">
      {/* Pozadí grid a efekty */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="stats-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(138, 1, 1, 0.08)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stats-grid)" />
        </svg>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`h-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-[#8a0101]/30 to-transparent"
              style={{
                top: `${(i + 1) * 25}%`,
                width: '120px',
              }}
              animate={{
                x: ['-120px', 'calc(100vw + 120px)'],
              }}
              transition={{
                duration: 15 + (i * 2),
                repeat: Infinity,
                delay: i * 1,
                ease: "linear"
              }}
            />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={`square-${i}`}
              className="absolute border border-[#8a0101]/15"
              style={{
                width: '25px',
                height: '25px',
                left: `${Math.random() * 90}%`,
                top: `${Math.random() * 90}%`,
              }}
              animate={{
                opacity: [0, 0.3, 0],
                scale: [0.8, 1.1, 0.8],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>
      {/* Glow background efekty */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 z-0 -translate-x-1/2">
        <motion.div 
          className="h-[400px] w-[800px] rounded-full bg-[#8a0101]/8 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      <div className="pointer-events-none absolute right-1/3 bottom-1/3 z-0">
        <motion.div 
          className="h-[300px] w-[500px] rounded-full bg-[#8a0101]/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [-20, 20, -20],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      <div className="relative z-10 space-y-10 md:space-y-14 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto py-10 sm:py-16 md:py-20 lg:py-24">
          {/* Nadpis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6 text-center mb-10"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#8a0101]/80 to-[#b90505]/80 shadow-lg shadow-[#8a0101]/30 w-12 h-12">
                <BarChart3 className="h-7 w-7 text-foreground dark:text-white drop-shadow-[0_0_8px_#8a0101]" />
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground dark:text-white tracking-tight drop-shadow">Server statistiky</h1>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Přehled ekonomiky, členské základny a aktivity na Retrovax FiveM serveru. Sledujte růst naší komunity v reálném čase.
            </p>
          </motion.div>

          {/* Statistiky grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-14"
          >
            {statsItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 + (index * 0.1), ease: "easeOut" }}
                >
                  <div className={`relative group rounded-3xl bg-gradient-to-br from-[#0e1012]/90 via-[#151a1c]/90 to-[#111b22]/95 border shadow-2xl p-8 flex flex-col items-center justify-center overflow-hidden hover:scale-[1.03] transition-transform duration-300 ${item.borderColor}`}> 
                    {/* Badge v levém horním rohu */}
                    <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
                      <span className={`inline-flex items-center justify-center rounded-full ${item.bgColor} ${item.color} border ${item.borderColor} p-3 shadow-md`}>
                        <Icon className="h-7 w-7 drop-shadow-[0_0_8px_currentColor]" />
                      </span>
                      <span className={`uppercase text-xs font-bold tracking-wider ${item.color} ml-1`}>{item.title}</span>
                    </div>
                    {/* Ikona v pozadí */}
                    <div className="absolute -top-6 -right-6 opacity-30 group-hover:opacity-50 transition-opacity duration-300">
                      <Icon className={`w-24 h-24 ${item.color}/20`} />
                    </div>
                    {/* Číslo */}
                    <div className={`text-5xl sm:text-6xl font-extrabold ${item.color} drop-shadow-[0_0_12px_currentColor] mb-2 mt-12`}> {/* mt-12 kvůli prostoru pro badge */}
                      {loading ? <span className="animate-pulse">...</span> : <CountUp from={0} to={item.value} separator="," direction="up" duration={2} />}
                    </div>
                    {/* Popisek */}
                    <div className="text-sm text-gray-400 font-medium text-center mt-2">{item.description}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Whitelist statistiky */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
            className="mb-14"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#8a0101]/80 to-[#b90505]/80 shadow-lg shadow-[#8a0101]/30 w-10 h-10">
                <ShieldCheck className="h-6 w-6 text-foreground dark:text-white drop-shadow-[0_0_8px_#8a0101]" />
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground dark:text-white tracking-tight drop-shadow">Whitelist statistiky</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Počet žádostí */}
              <div className="relative group rounded-3xl bg-gradient-to-br from-[#0e1012]/90 via-[#151a1c]/90 to-[#111b22]/95 border border-[#8a0101]/20 shadow-2xl p-8 flex flex-col items-center justify-center overflow-hidden hover:scale-[1.03] transition-transform duration-300">
                <div className="absolute -top-6 -right-6 opacity-30 group-hover:opacity-50 transition-opacity duration-300">
                  <FileText className="w-24 h-24 text-cyan-400/20" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30 p-3">
                    <FileText className="h-7 w-7 text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]" />
                  </span>
                  <span className="uppercase text-xs font-bold tracking-wider text-cyan-300">Žádostí</span>
                </div>
                <div className="text-5xl sm:text-6xl font-extrabold text-cyan-400 drop-shadow-[0_0_12px_#22d3ee] mb-2">
                  {loading ? <span className="animate-pulse">...</span> : stats.totalWhitelistRequests}
                </div>
                <div className="text-sm text-gray-400 font-medium">Celkem odeslaných formulářů</div>
              </div>
              {/* Úspěšnost */}
              <div className="relative group rounded-3xl bg-gradient-to-br from-[#0e1012]/90 via-[#151a1c]/90 to-[#111b22]/95 border border-emerald-400/20 shadow-2xl p-8 flex flex-col items-center justify-center overflow-hidden hover:scale-[1.03] transition-transform duration-300">
                <div className="absolute -top-6 -right-6 opacity-30 group-hover:opacity-50 transition-opacity duration-300">
                  <TrendingUp className="w-24 h-24 text-emerald-400/20" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-emerald-400/10 border border-emerald-400/30 p-3">
                    <TrendingUp className="h-7 w-7 text-emerald-400 drop-shadow-[0_0_8px_#34d399]" />
                  </span>
                  <span className="uppercase text-xs font-bold tracking-wider text-emerald-300">Úspěšnost</span>
                </div>
                <div className="text-5xl sm:text-6xl font-extrabold text-emerald-400 drop-shadow-[0_0_12px_#34d399] mb-2">
                  {loading ? <span className="animate-pulse">...</span> : `${whitelistSuccessRate}%`}
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  {loading ? null : (
                    <>
                      Schváleno <span className="text-emerald-300 font-bold">{stats.approvedWhitelistRequests}</span> z <span className="text-cyan-300 font-bold">{stats.totalWhitelistRequests}</span> žádostí
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shrnutí serveru */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="w-full max-w-2xl rounded-3xl bg-gradient-to-br from-[#131618]/90 via-[#151a1c]/90 to-[#111b22]/95 border border-white/10 shadow-2xl backdrop-blur-md p-8 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#8a0101]/80 to-[#b90505]/80 shadow-lg shadow-[#8a0101]/30 w-10 h-10">
                  <TrendingUp className="h-6 w-6 text-foreground dark:text-white drop-shadow-[0_0_8px_#8a0101]" />
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground dark:text-white tracking-tight drop-shadow">Shrnutí serveru</h2>
              </div>
              <p className="text-gray-300 leading-relaxed text-base sm:text-lg text-center mb-6">
                Server Retrovax FiveM úspěšně provozujeme již <span className="text-orange-400 font-semibold">{stats.daysRunning} dní</span>.<br/>
                Naše komunita čítá <span className="text-purple-400 font-semibold">{stats.totalDiscordMembers.toLocaleString()} členů</span> na Discordu
                a <span className="text-[#8a0101] font-semibold">{stats.totalWhitelisted.toLocaleString()} schválených hráčů</span>.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/10 w-full">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-1">${stats.totalMoney.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Ekonomika</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-1">{stats.totalCharacters.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Aktivní postavy</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}