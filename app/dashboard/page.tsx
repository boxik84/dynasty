'use client'

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { User, ShieldCheck, Hash, AtSign, Crown, Shield, Code, Calendar, Users, Car, Database, ChevronRight, Activity, Award, AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface UserData {
  userId: string; // Better-auth user ID
  hasWhitelist: boolean;
  discordId: string | null; // Discord account ID (může být null)
  username: string; // Display name (nick, global_name, nebo username)
  usernameTag: string; // Plný Discord tag
  realUsername: string; // Skutečné Discord username
  email?: string; // Better-auth email
  image?: string; // Better-auth user image
  discriminator: string;
  roles: string[];
  createdAt: string; // Better-auth user createdAt
  updatedAt: string; // Better-auth user updatedAt
  sessionId: string; // Better-auth session ID
  sessionExpiresAt: string; // Better-auth session expiry
  permissions: {
    hasVedeniRole: boolean;
    hasStaffRole: boolean;
    hasDeveloperRole: boolean;
    hasWaitingRole: boolean;
    isBlacklisted: boolean;
    hasWhitelistPermissions: boolean;
    hasVedeniOrStaffPermissions: boolean;
  };
  warning?: string; // Pro případy, kdy Discord account není linkován
  error?: string; // Pro error handling
}

export default function PrehledMainPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/user/me", { cache: "no-store" });
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Chyba při načítání uživatelských dat:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    {
      title: "Moje postavy",
      description: "Spravuj své postavy a sleduj jejich detaily",
      icon: Users,
      href: "/dashboard/characters",
      color: "text-[#b90505]",
      bgColor: "bg-[#b90505]/10",
      borderColor: "border-[#b90505]/30"
    },
    {
      title: "Vozidla",
      description: "Přehled a správa vozidel",
      icon: Car,
      href: "/dashboard/vehicles",
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      borderColor: "border-green-400/30",
      requiresVedeniOrStaff: true
    },
    {
      title: "Databáze postav",
      description: "Správa všech postav na serveru",
      icon: Database,
      href: "/dashboard/database-characters",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/30",
      requiresVedeniOrStaff: true
    }
  ];

  const getUserStatus = () => {
    if (!user) return 'loading';

    // Kontrola blacklistu
    if (user.permissions.isBlacklisted) {
      return 'blacklisted';
    }

    // Kontrola whitelistu
    if (user.hasWhitelist) {
      return 'whitelisted';
    }

    // Kontrola waiting role
    if (user.permissions.hasWaitingRole) {
      return 'waiting';
    }

    // Nemá ani whitelist ani waiting role
    return 'no_access';
  };

  const filteredActions = quickActions.filter(action => {
    // Pro blacklisted uživatele nezobrazujeme "Moje postavy"
    if (getUserStatus() === 'blacklisted' && action.href === '/dashboard/characters') {
      return false;
    }

    return !action.requiresVedeniOrStaff || user?.permissions.hasVedeniOrStaffPermissions;
  });

  const getUserRoleBadges = () => {
    const badges = [];
    if (user?.permissions.hasVedeniRole) {
      badges.push({
        label: "Vedení",
        icon: Crown,
        color: "bg-purple-500/20 text-purple-300 border-purple-500/40"
      });
    }
    if (user?.permissions.hasStaffRole) {
      badges.push({
        label: "Staff Team",
        icon: Shield,
        color: "bg-blue-500/20 text-blue-300 border-blue-500/40"
      });
    }
    if (user?.permissions.hasDeveloperRole) {
      badges.push({
        label: "Developer Team",
        icon: Code,
        color: "bg-orange-500/20 text-orange-300 border-orange-500/40"
      });
    }
    return badges;
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a]">
        
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[300px] w-[400px] md:h-[400px] md:w-[600px] rounded-full bg-[#b90505]/8 blur-3xl" />
        </div>

        <div className="relative z-10 space-y-4 sm:space-y-6 px-4 md:px-0">
          <div className="space-y-3 sm:space-y-4">
            <Skeleton className="h-6 w-32 sm:h-8 sm:w-48 bg-white/5" />
            <Skeleton className="h-3 w-64 sm:h-4 sm:w-96 bg-white/5" />
          </div>
          <Separator className="bg-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Skeleton className="h-32 sm:h-40 lg:h-48 w-full bg-white/5" />
            <Skeleton className="h-32 sm:h-40 lg:h-48 w-full bg-white/5" />
            <Skeleton className="h-32 sm:h-40 lg:h-48 w-full bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a]">
      
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[400px] w-[500px] md:h-[400px] md:w-[800px] rounded-full bg-[#b90505]/6 md:bg-[#b90505]/10 blur-3xl" />
        <div className="absolute right-1/3 bottom-1/3 h-[250px] w-[350px] md:h-[300px] md:w-[500px] rounded-full bg-[#b90505]/3 md:bg-[#b90505]/5 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 sm:space-y-8 px-4 md:px-0">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-3 sm:space-y-4"
        >
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Badge
              variant="outline"
              className="border-[#b90505]/60 text-[#bd2727] bg-[#b90505]/10 px-3 py-1 sm:px-4 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur flex gap-2"
            >
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-[#b90505] drop-shadow-[0_0_5px_#b90505]" />
              Dashboard
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground dark:text-white text-center drop-shadow">
            Vítej zpět, <span className="block sm:inline">{user?.username || 'Hráči'}!</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 text-center max-w-2xl mx-auto px-4">
            Zde najdeš všechny důležité informace o svém účtu a rychlý přístup k hlavním funkcím.
          </p>
        </motion.div>

        <Separator className="bg-white/10" />

        {user ? (
          <div className="space-y-6 sm:space-y-8">
            
            {(user.warning || user.error) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              >
                <Card className={`bg-gradient-to-br ${user.error ? 'from-red-900/40 via-red-800/30 to-red-900/40 border-red-500/50' : 'from-yellow-900/40 via-yellow-800/30 to-yellow-900/40 border-yellow-500/50'} shadow-xl rounded-2xl backdrop-blur-md`}>
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`p-2 sm:p-3 rounded-full ${user.error ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'} shrink-0`}>
                        <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 drop-shadow-[0_0_10px_currentColor]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold ${user.error ? 'text-red-300' : 'text-yellow-300'} mb-1 sm:mb-2`}>
                          {user.error ? '⚠️ CHYBA API' : '⚠️ UPOZORNĚNÍ'}
                        </h3>
                        <p className={`text-sm sm:text-base ${user.error ? 'text-red-200' : 'text-yellow-200'}`}>
                          {user.error || user.warning}
                          {user.warning && !user.discordId && (
                            <span className="block mt-2">
                              Pro plnou funkcionalnost propoj svůj Discord účet přes přihlášení.
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            
            {getUserStatus() === 'blacklisted' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              >
                <Card className="bg-gradient-to-br from-red-900/40 via-red-800/30 to-red-900/40 border border-red-500/50 shadow-xl rounded-2xl backdrop-blur-md">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 rounded-full bg-red-500/20 text-red-400 shrink-0">
                        <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 drop-shadow-[0_0_10px_currentColor]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-red-300 mb-1 sm:mb-2">⚠️ BLACKLIST UPOZORNĚNÍ</h3>
                        <p className="text-sm sm:text-base text-red-200">
                          Tvůj účet je na blacklistu. Nemáš přístup k postavám a některým funkcím.
                          Pro vyřešení této situace kontaktuj administrátora na našem Discord serveru.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
            >
              
              <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
                <CardHeader className="flex flex-row items-center gap-3 pb-2 sm:pb-3">
                  <div className={`p-2 rounded-lg shrink-0 ${getUserStatus() === 'whitelisted' ? 'bg-green-500/20 text-green-400' :
                      getUserStatus() === 'waiting' ? 'bg-yellow-500/20 text-yellow-400' :
                        getUserStatus() === 'blacklisted' ? 'bg-red-500/20 text-red-400' :
                          'bg-red-500/20 text-red-400'
                    }`}>
                    {getUserStatus() === 'whitelisted' ? <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-[0_0_5px_currentColor]" /> :
                      getUserStatus() === 'waiting' ? <Clock className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-[0_0_5px_currentColor]" /> :
                        getUserStatus() === 'blacklisted' ? <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-[0_0_5px_currentColor]" /> :
                          <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-[0_0_5px_currentColor]" />}
                  </div>
                  <CardTitle className="text-foreground dark:text-white text-sm sm:text-base">Stav účtu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  {getUserStatus() === 'whitelisted' ? (
                    <>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/40 text-xs sm:text-sm">
                        ✓ Máš whitelist
                      </Badge>
                      <p className="text-xs sm:text-sm text-gray-300">
                        Máš přístup na server. Užij si hraní! Pokud narazíš na problém, kontaktuj administrátora.
                      </p>
                    </>
                  ) : getUserStatus() === 'waiting' ? (
                    <>
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40 text-xs sm:text-sm">
                        ⏳ Čekáš na schválení
                      </Badge>
                      <p className="text-xs sm:text-sm text-gray-300">
                        Tvoje žádost je ve zpracování. Sleduj Discord pro aktualizace nebo kontaktuj administrátora.
                      </p>
                    </>
                  ) : getUserStatus() === 'blacklisted' ? (
                    <>
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-xs sm:text-sm">
                        ⚠️ Máš blacklist
                      </Badge>
                      <p className="text-xs sm:text-sm text-gray-300">
                        Tvůj účet je na blacklistu. Pro více informací kontaktuj administrátora na Discordu.
                      </p>
                    </>
                  ) : (
                    <>
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-xs sm:text-sm">
                        ✗ Nemáš přístup
                      </Badge>
                      <p className="text-xs sm:text-sm text-gray-300">
                        Pro přístup na server je potřeba být na whitelistu. Kontaktuj administrátora nebo postupuj podle pokynů na našem Discordu.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              
              <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
                <CardHeader className="flex flex-row items-center gap-3 pb-2 sm:pb-3">
                  <div className="p-2 rounded-lg bg-[#326e98]/20 text-[#326e98] shrink-0">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-[0_0_5px_#326e98]" />
                  </div>
                  <CardTitle className="text-foreground dark:text-white text-sm sm:text-base">Discord informace</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    {user.discordId ? (
                      <>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                          <span className="font-medium">Discord ID:</span> 
                          <span className="truncate font-mono text-gray-200">{user.discordId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <AtSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                          <span className="font-medium">Zobrazované jméno:</span> 
                          <span className="truncate font-semibold text-foreground dark:text-white">{user.username}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                          <span className="font-medium">Discord tag:</span> 
                          <span className="truncate font-mono text-gray-200">{user.usernameTag}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                        <span className="font-medium">Discord účet není propojený</span>
                      </div>
                    )}
                    {user.email && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <AtSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                        <span className="font-medium">Email:</span> 
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                      <span className="font-medium">Registrován:</span> 
                      <span className="truncate">{new Date(user.createdAt).toLocaleDateString('cs-CZ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                      <span className="font-medium">Session do:</span> 
                      <span className="truncate">{new Date(user.sessionExpiresAt).toLocaleDateString('cs-CZ', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            
            {getUserRoleBadges().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              >
                <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2 sm:pb-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-[0_0_5px_currentColor]" />
                    </div>
                    <CardTitle className="text-foreground dark:text-white text-sm sm:text-base">Tvoje pozice</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {getUserRoleBadges().map((badge, index) => {
                        const Icon = badge.icon;
                        return (
                          <Badge
                            key={index}
                            className={`${badge.color} flex items-center gap-1 border text-xs sm:text-sm`}
                          >
                            <Icon className="w-3 h-3" />
                            {badge.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              className="space-y-3 sm:space-y-4"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white text-center">Rychlé akce</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={index} href={action.href}>
                      <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 hover:border-white/20 shadow-xl rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer group h-full">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2 sm:pb-3">
                          <div className={`p-2 rounded-lg ${action.bgColor} ${action.color} border ${action.borderColor} shrink-0`}>
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-[0_0_5px_currentColor]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-foreground dark:text-white text-sm sm:text-base truncate">{action.title}</CardTitle>
                          </div>
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-foreground dark:text-white transition-colors shrink-0" />
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{action.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-red-500/20 shadow-xl rounded-2xl backdrop-blur-md max-w-md mx-auto">
              <CardContent className="pt-4 sm:pt-6">
                <p className="text-red-400 text-sm sm:text-base">Nepodařilo se načíst uživatelská data.</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}