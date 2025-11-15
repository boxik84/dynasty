"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/sidebar-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Home, User, Users, Car, Database, Settings, LogOut, UserCheck, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const sidebarNavItems = [
  { title: "Přehled", href: "/dashboard", icon: Home },
  { title: "Moje Whitelist", href: "/dashboard/my-whitelist", icon: FileText },
  { title: "Postavy", href: "/dashboard/characters", icon: Users },
  {
    title: "Vozidla",
    href: "/dashboard/vehicles",
    icon: Car,
    requiresVedeniOrStaff: true, // Vedení nebo Staff
  },
  {
    title: "Databáze postav",
    href: "/dashboard/database-characters",
    icon: Database,
    requiresVedeniOrStaff: true, // Vedení nebo Staff
  },
  {
    title: "Whitelist",
    href: "/dashboard/whitelist",
    icon: UserCheck,
    requiresWhitelistPermissions: true, // Speciální kontrola pro whitelist oprávnění
  },
];

interface UserData {
  userId: string; // Better-auth user ID
  discordId: string | null; // Discord account ID (může být null)
  username: string; // Display name (nick, global_name, nebo username)
  usernameTag: string; // Plný Discord tag
  realUsername: string; // Skutečné Discord username
  email?: string; // Better-auth email
  image?: string; // Better-auth user image
  discriminator: string;
  roles: string[];
  hasWhitelist: boolean;
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
    hasWhitelistAdderPermissions: boolean;
    isAdmin: boolean;
  };
  warning?: string; // Pro případy, kdy Discord account není linkován
  error?: string; // Pro error handling
}

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: SettingsLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  const handleLogout = async () => {
    await authClient.signOut();
        window.location.href = "/";
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me", { cache: "no-store" });
        const data = await res.json();

        if (!data?.discordId) {
          toast.error("Nepodařilo se načíst uživatelská data");
          router.push("/sign-in");
        } else {
          setUser(data);
        }
      } catch (error) {
        console.error("Chyba při načítání uživatele:", error);
        toast.error("Nastala chyba při načítání profilu");
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0a]">
        
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[300px] w-[400px] md:h-[400px] md:w-[600px] rounded-full bg-[#b90505]/8 blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl py-4 sm:py-6 lg:py-10 px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-32 sm:h-8 sm:w-48 mb-6 sm:mb-8 bg-white/5" />
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            <Skeleton className="w-full lg:w-64 h-64 sm:h-80 lg:h-96 bg-white/5 rounded-2xl" />
            <Skeleton className="w-full lg:flex-1 h-64 sm:h-80 lg:h-96 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Funkce pro určení stavu uživatele
  const getUserStatus = () => {
    if (!user || !user.permissions) return 'loading';
    
    // Kontrola blacklistu
    if (user.permissions.isBlacklisted) {
      return 'blacklisted';
    }
    
    // Kontrola waiting role
    if (user.permissions.hasWaitingRole) {
      return 'waiting';
    }
    
    // Kontrola whitelistu
    if (user.hasWhitelist) {
      return 'whitelisted';
    }
    
    // Nemá ani whitelist ani waiting role
    return 'no_access';
  };

  const userStatus = getUserStatus();

  // Pokud má uživatel blacklist nebo waiting role, zobraz pouze "Přehled"
  const filteredNavItems = userStatus === 'blacklisted' || userStatus === 'waiting' 
    ? sidebarNavItems.filter(item => item.href === '/dashboard') // Pouze "Přehled"
    : sidebarNavItems.filter((item) => {
        // Safety check pro permissions
        if (!user.permissions) return true;
        
        // Kontrola Vedení nebo Staff oprávnění
        if (item.requiresVedeniOrStaff) {
          console.log('Dashboard nav item (Vedení/Staff) check:', {
            item: item.title,
            hasVedeniOrStaffPermissions: user.permissions.hasVedeniOrStaffPermissions
          });
          if (!user.permissions.hasVedeniOrStaffPermissions) {
            return false;
          }
        }
        
        // Kontrola whitelist oprávnění - přístup mají whitelist adderi, staff a vedení
        if (item.requiresWhitelistPermissions) {
          const hasWhitelistAccess = user.permissions.hasWhitelistAdderPermissions || 
                                   user.permissions.hasVedeniOrStaffPermissions;
          console.log('Dashboard layout whitelist check:', {
            hasWhitelistAdderPermissions: user.permissions.hasWhitelistAdderPermissions,
            hasVedeniOrStaffPermissions: user.permissions.hasVedeniOrStaffPermissions,
            hasWhitelistAccess: hasWhitelistAccess,
            item: item.title
          });
          if (!hasWhitelistAccess) {
            return false;
          }
        }
        
        return true;
      });

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <div className="relative z-10 container mx-auto max-w-7xl py-4 sm:py-6 lg:py-10 px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6 sm:space-y-8"
        >
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 sm:mb-6 lg:mb-8">
            <div className="text-center sm:text-left">
              <Badge
                variant="outline"
                className="border-[#b90505]/60 text-[#bd2727] bg-[#b90505]/10 px-3 py-1 sm:px-4 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur flex gap-2"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-[#bd2727] drop-shadow-[0_0_5px_#bd2727]" />
                <span className="truncate max-w-[120px] sm:max-w-none">{user.username}</span>
              </Badge>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mt-2 mb-1 sm:mb-2">Dashboard</h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-400">Spravuj svůj účet a přístup k serveru</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors w-full sm:w-auto text-xs sm:text-sm"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Odhlásit se
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="w-full lg:w-64 flex-shrink-0"
            >
              <div className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 rounded-2xl backdrop-blur-md p-3 sm:p-4 lg:p-6">
                <SidebarNav items={filteredNavItems} userRoles={user.roles} />
              </div>
            </motion.aside>

            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="flex-1 w-full"
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}