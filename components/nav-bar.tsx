"use client";

import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    NavbarButton,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from "@/components/ui/resizable-navbar";

import Link from "next/link";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { LogOut, User, Shield } from "lucide-react";
import { siteConfig } from "@/config/site";
import { MotionHighlight, MotionHighlightItem } from "@/components/animate-ui/effects/motion-highlight";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export function NavbarDemo() {
    const navItems = [
        {
            name: "Pravidla",
            link: siteConfig.links.rules,
        },
        {
            name: "Obchod",
            link: siteConfig.links.store,
        },
        {
            name: "Whitelist",
            link: siteConfig.links.whitelist,
        },
        {
            name: "Statistiky",
            link: siteConfig.links.statistics,
        },
        {
            name: "Fotosoutěž",
            link: siteConfig.links.fotosoutez,
        },
        {
            name: "Tým",
            link: siteConfig.links.team,
        },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { data: session } = authClient.useSession();
    const isLoggedIn = !!session?.user;
    const pathname = usePathname();

    const dropdownContentClass =
        "w-64 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-2xl shadow-slate-200/70 dark:border-white/10 dark:bg-neutral-950";
    const dropdownLabelClass =
        "px-1 text-sm font-semibold text-slate-900 dark:text-white";
    const dropdownSeparatorClass = "my-1 h-px bg-slate-200 dark:bg-white/10";
    const highlightWrapperClass =
        "rounded-2xl border border-rose-100 bg-rose-50/80 shadow-sm dark:border-[#b90505]/40 dark:bg-[#b90505]/10";
    const highlightActiveClass =
        "bg-white text-[#b90505] border border-rose-200 shadow-[0_8px_24px_rgba(244,63,94,0.18)] dark:bg-[#b90505]/20 dark:text-white dark:border-[#b90505]/50";
    const menuItemClass = (active: boolean) =>
        cn(
            "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 hover:text-[#b90505] dark:hover:text-white",
            active
                ? "text-[#b90505] dark:text-white"
                : "text-slate-600 dark:text-gray-200"
        );
    const menuIconClass = (active: boolean) =>
        cn(
            "mr-2 h-4 w-4 transition-all duration-200",
            active ? "text-[#b90505]" : "text-slate-400 dark:text-gray-400"
        );

    const renderUserMenuItems = (closeMenu?: () => void) => {
        const dashboardActive = pathname.startsWith('/dashboard');
        const adminActive = pathname.startsWith('/admin');

        const handleNavigate = () => closeMenu?.();

        return (
            <MotionHighlight
                hover
                controlledItems
                className={highlightWrapperClass}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
                <MotionHighlightItem
                    activeClassName={dashboardActive ? highlightActiveClass : ''}
                    asChild
                >
                    <Link href={siteConfig.links.dashboard}>
                        <DropdownMenuItem
                            onClick={handleNavigate}
                            className={menuItemClass(dashboardActive)}
                        >
                            <User className={menuIconClass(dashboardActive)} />
                            Přehled
                            {dashboardActive && (
                                <div className="absolute right-3 h-2 w-2 rounded-full bg-[#b90505] shadow-[0_0_8px_rgba(185,5,5,0.7)]" />
                            )}
                        </DropdownMenuItem>
                    </Link>
                </MotionHighlightItem>

                {isAdmin && (
                    <>
                        <DropdownMenuSeparator className={dropdownSeparatorClass} />
                        <MotionHighlightItem
                            activeClassName={adminActive ? highlightActiveClass : ''}
                            asChild
                        >
                            <Link href="/admin">
                                <DropdownMenuItem
                                    onClick={handleNavigate}
                                    className={menuItemClass(adminActive)}
                                >
                                    <Shield className={menuIconClass(adminActive)} />
                                    Admin Panel
                                    {adminActive && (
                                        <div className="absolute right-3 h-2 w-2 rounded-full bg-[#b90505] shadow-[0_0_8px_rgba(185,5,5,0.7)]" />
                                    )}
                                </DropdownMenuItem>
                            </Link>
                        </MotionHighlightItem>
                    </>
                )}
            </MotionHighlight>
        );
    };

    useEffect(() => {
        const checkAdminPermissions = async () => {
            if (isLoggedIn) {
                try {
                    const response = await fetch('/api/user/me');
                    if (response.ok) {
                        const userData = await response.json();
                        setIsAdmin(userData.permissions?.isAdmin || false);
                    }
                } catch (error) {
                    console.error('Error checking admin permissions:', error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        };

        checkAdminPermissions();
    }, [isLoggedIn]);

    const handleLogout = async () => {
        try {
            toast("Odhlašování...", {
                id: "logout",
                icon: <Icons.spinner className="h-4 w-4 animate-spin" />,
                duration: Infinity
            });
            
            await authClient.signOut();
            
            toast.success("Úspěšně odhlášen! 👋", {
                id: "logout",
                duration: 2000
            });
            
            setTimeout(() => {
                window.location.href = "/";
            }, 500);
        } catch (error) {
            console.error('Logout error:', error);
            toast.error("Chyba při odhlašování", {
                id: "logout"
            });
        }
    };

    return (
        <Navbar>
            
            <NavBody>
                <NavbarLogo />
                <NavItems items={navItems} />
                <div className="relative">
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Avatar className="h-9 w-9 border border-slate-200 transition-all duration-300 hover:border-[#b90505]/50 hover:shadow-lg hover:shadow-rose-200/70 dark:border-white/20 dark:hover:border-[#b90505]/40 dark:hover:shadow-[#b90505]/25">
                                    <AvatarImage src={session.user.image || ""} alt={session.user.name || "Uživatel"} />
                                    <AvatarFallback className="bg-gradient-to-br from-[#b90505] to-[#8a0101] text-white font-bold">
                                        {session.user.name?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className={dropdownContentClass}>
                                <DropdownMenuLabel className={dropdownLabelClass}>
                                    {session.user.name}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className={dropdownSeparatorClass} />

                                {renderUserMenuItems()}

                                <DropdownMenuSeparator className={dropdownSeparatorClass} />
                                <DropdownMenuItem 
                                    onClick={handleLogout} 
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 focus:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/20 dark:focus:bg-red-500/20"
                                >
                                    <LogOut className="mr-2 h-4 w-4" /> 
                                    Odhlásit se
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
                        >
                            <Link href="/sign-in">Přihlásit se</Link>
                        </Button>
                    )}
                </div>
            </NavBody>

            
            <MobileNav>
                <MobileNavHeader>
                    <NavbarLogo />
                    <MobileNavToggle
                        isOpen={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    />
                </MobileNavHeader>

                <MobileNavMenu
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                >
                    {navItems.map((item, idx) => (
                        <a
                            key={`mobile-link-${idx}`}
                            href={item.link}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="relative text-neutral-600 dark:text-neutral-300"
                        >
                            <span className="block">{item.name}</span>
                        </a>
                    ))}
                    <div className="flex w-full flex-col gap-4">
                        {isLoggedIn ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Avatar className="h-10 w-10 self-center border border-slate-200 transition-all duration-300 hover:border-[#b90505]/50 hover:shadow-lg hover:shadow-rose-200/70 dark:border-white/20 dark:hover:border-[#b90505]/40 dark:hover:shadow-[#b90505]/25">
                                        <AvatarImage src={session.user.image || ""} alt={session.user.name || "Uživatel"} />
                                        <AvatarFallback className="bg-gradient-to-br from-[#b90505] to-[#8a0101] text-white font-bold">
                                            {session.user.name?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className={dropdownContentClass}>
                                    <DropdownMenuLabel className={dropdownLabelClass}>
                                        {session.user.name}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className={`${dropdownSeparatorClass} my-1`} />

                                    {renderUserMenuItems(() => setIsMobileMenuOpen(false))}

                                    <DropdownMenuSeparator className={`${dropdownSeparatorClass} my-1`} />
                                    <DropdownMenuItem 
                                        onClick={handleLogout} 
                                        className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 focus:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/20 dark:focus:bg-red-500/20"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" /> 
                                        Odhlásit se
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full rounded-xl border border-slate-200 py-3 text-slate-900 transition-colors duration-200 hover:bg-slate-50 hover:cursor-pointer dark:border-white/30 dark:text-white dark:hover:bg-white/10"
                            >
                                <Link href="/sign-in">Přihlásit se</Link>
                            </Button>
                        )}
                    </div>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
}
