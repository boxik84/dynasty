"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { User, Calendar, DollarSign, Ruler, Users, ShieldAlert, Eye, Clock, Banknote, Crown, Activity } from "lucide-react";

export interface PostavyEntity {
  firstname: string;
  lastname: string;
  identifier: string;
  name: string;
  accounts: string;
  dateofbirth: string;
  sex: string;
  height: number;
  created_at: string;
  last_seen: string;
  iban: string | null;
  steam_id: number;
}

interface UserData {
  userId: string;
  discordId: string | null;
  username: string;
  usernameTag: string;
  realUsername: string;
  email?: string;
  image?: string;
  discriminator: string;
  roles: string[];
  hasWhitelist: boolean;
  createdAt: string;
  updatedAt: string;
  sessionId: string;
  sessionExpiresAt: string;
  permissions: {
    hasVedeniRole: boolean;
    hasStaffRole: boolean;
    hasDeveloperRole: boolean;
    hasWaitingRole: boolean;
    isBlacklisted: boolean;
    hasWhitelistPermissions: boolean;
    hasVedeniOrStaffPermissions: boolean;
  };
}

export default function DashboardCharactersPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [characters, setCharacters] = useState<PostavyEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const fetchData = async () => {
      if (isPending) return;
      if (!session?.user?.id) {
        router.push("/sign-in");
        return;
      }

      try {
        // Použít nové API pro získání user dat včetně permissions
        const userRes = await fetch("/api/user/me", { cache: "no-store" });
        const userData = await userRes.json();

        if (!userData?.discordId) {
          toast.error("Nepodařilo se načíst uživatelská data");
          router.push("/sign-in");
          return;
        }

        setUser(userData);

        // Načíst postavy pouze pokud má uživatel přístup
        if (userData.hasWhitelist || userData.permissions?.hasWhitelistPermissions) {
          const charactersRes = await fetch(`/api/postavy?discordId=${userData.discordId}`);
          if (charactersRes.ok) {
            const data = await charactersRes.json();
            setCharacters(data.postavy || []);
            if (data.postavy && data.postavy.length > 0) {
              toast.success(`Načteno ${data.postavy.length} postav`);
            }
          } else {
            toast.error("Chyba při načítání postav");
          }
        }
      } catch (error) {
        console.error("Chyba při načítání dat:", error);
        toast.error("Nastala chyba při načítání dat");
        router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isPending, session, router]);

  if (loading || !user) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0a]">
        
        <div className="pointer-events-none absolute left-1/2 top-1/4 z-0 -translate-x-1/2">
          <div className="h-[400px] w-[600px] rounded-full bg-[#b90505]/8 blur-3xl" />
        </div>
        
        <div className="relative z-10 space-y-6 px-4 md:px-0">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 bg-white/5" />
            <Skeleton className="h-4 w-96 bg-white/5" />
          </div>
          <Separator className="bg-white/10" />
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/5 border border-white/10 rounded-2xl">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-6 w-1/2 bg-white/10" />
                  <Skeleton className="h-4 w-1/3 bg-white/10" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full bg-white/10" />
                  <Skeleton className="h-4 w-full bg-white/10" />
                  <Skeleton className="h-4 w-full bg-white/10" />
                  <Skeleton className="h-4 w-full bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      
      <div className="pointer-events-none absolute left-1/2 top-1/4 z-0 -translate-x-1/2">
        <div className="h-[400px] w-[800px] rounded-full bg-[#b90505]/8 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute right-1/3 bottom-1/3 z-0">
        <div className="h-[300px] w-[500px] rounded-full bg-[#b90505]/5 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8 px-4 md:px-0">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center mb-6">
            <Badge
              variant="outline"
              className="border-[#b90505]/60 text-[#bd2727] bg-[#b90505]/10 px-4 py-1 font-semibold tracking-wide backdrop-blur flex gap-2"
            >
              <Users className="h-4 w-4 text-[#bd2727] drop-shadow-[0_0_5px_#bd2727]" />
              Moje postavy
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white text-center drop-shadow">
            Správa postav
          </h1>
          <p className="text-lg text-gray-400 text-center max-w-2xl mx-auto">
            Spravujte své postavy a sledujte jejich detaily, bankovní účty a aktivity.
          </p>
        </motion.div>

        <Separator className="bg-white/10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          {user.hasWhitelist || user.permissions?.hasWhitelistPermissions ? (
            characters.length > 0 ? (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center gap-3 pb-3">
                      <div className="p-2 rounded-lg bg-[#b90505]/20 text-[#bd2727]">
                        <Users className="h-5 w-5 drop-shadow-[0_0_5px_#bd2727]" />
                      </div>
                      <CardTitle className="text-white text-sm">Celkem postav</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-[#bd2727]">{characters.length}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center gap-3 pb-3">
                      <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                        <Banknote className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
                      </div>
                      <CardTitle className="text-white text-sm">Celkové bohatství</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-green-400">
                        ${characters.reduce((total, char) => {
                          try {
                            const accounts = JSON.parse(char.accounts || "{}");
                            return total + (accounts.bank || 0) + (accounts.money || 0);
                          } catch {
                            return total;
                          }
                        }, 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center gap-3 pb-3">
                      <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                        <Activity className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
                      </div>
                      <CardTitle className="text-white text-sm">Poslední aktivita</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300">
                        {new Date(Math.max(...characters.map(char => new Date(char.last_seen).getTime()))).toLocaleDateString('cs-CZ')}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {characters.map((character, index) => (
                    <motion.div
                      key={character.identifier}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <Link href={`/dashboard/characters/${character.identifier}`}>
                        <CharacterCard character={character} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md max-w-md mx-auto">
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 rounded-full bg-[#b90505]/20 text-[#bd2727] w-fit mb-4">
                    <Users className="h-8 w-8 drop-shadow-[0_0_5px_#bd2727]" />
                  </div>
                  <CardTitle className="text-xl text-white">Žádné postavy</CardTitle>
                  <CardDescription className="text-gray-400">
                    Zatím nemáte vytvořené žádné postavy. Připojte se na server a vytvořte si svou první postavu!
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          ) : (
            <Card className="bg-gradient-to-br from-red-900/20 via-red-800/20 to-red-900/30 border border-red-500/20 shadow-xl rounded-2xl backdrop-blur-md max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-full bg-red-500/20 text-red-400 w-fit mb-4">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-red-400">
                  Přístup odepřen
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {user?.discordId
                    ? "Nemáte potřebný whitelist pro přístup k postavám."
                    : "Propojte svůj Discord účet pro zobrazení postav."}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const CharacterCard = ({ character }: { character: PostavyEntity }) => {
  let accounts;
  try {
    accounts = JSON.parse(character.accounts || "{}");
  } catch {
    accounts = { bank: 0, money: 0 };
  }

  const isMale = character.sex === "m";
  const totalMoney = (accounts.bank || 0) + (accounts.money || 0);
  
  // Výpočet, jak dlouho už postava existuje
  const createdDate = new Date(character.created_at);
  const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="group bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 hover:border-white/20 shadow-xl rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl font-bold text-white group-hover:text-[#bd2727] transition-colors">
              {character.firstname} {character.lastname}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                className={`${isMale ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-pink-500/20 text-pink-300 border-pink-500/40'} border`}
              >
                <User className="w-3 h-3 mr-1" />
                {isMale ? "Muž" : "Žena"}
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 border">
                <Ruler className="w-3 h-3 mr-1" />
                {character.height} cm
              </Badge>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[#b90505]/20 text-[#bd2727]">
            <Eye className="h-5 w-5 drop-shadow-[0_0_5px_#bd2727]" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        
        <Link href={`/dashboard/characters/bank?character=${character.identifier}`}>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-400/30 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300">Celkové bohatství</span>
              <DollarSign className="h-4 w-4 text-green-400 group-hover:drop-shadow-[0_0_5px_currentColor]" />
            </div>
            <p className="text-2xl font-bold text-green-400 group-hover:text-green-300">${formatBalance(totalMoney)}</p>
            <div className="flex justify-between text-xs text-gray-500 mt-2 group-hover:text-gray-400">
              <span>Banka: ${formatBalance(accounts.bank || 0)}</span>
              <span>Hotovost: ${formatBalance(accounts.money || 0)}</span>
            </div>
            <div className="text-xs text-gray-600 group-hover:text-gray-500 mt-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
              Klikněte pro detaily transakcí
            </div>
          </div>
        </Link>

        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-gray-400">Datum narození</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#bd2727]" />
              <span className="text-gray-300">{new Date(character.dateofbirth).toLocaleDateString("cs-CZ")}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-gray-400">Věk postavy</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-400" />
              <span className="text-gray-300">{daysSinceCreated} dní</span>
            </div>
          </div>
        </div>

        
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Naposledy viděn</span>
            <span className="text-xs text-gray-300">
              {new Date(character.last_seen).toLocaleString("cs-CZ")}
            </span>
          </div>
        </div>

        
        {character.iban && (
          <div className="p-3 rounded-lg bg-[#b90505]/10 border border-[#b90505]/30">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-[#bd2727] drop-shadow-[0_0_3px_#bd2727]" />
              <span className="text-xs text-[#bd2727] font-medium">IBAN: {character.iban}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function formatBalance(balance: number): string {
  return balance >= 1000 ? balance.toLocaleString() : balance.toString();
}