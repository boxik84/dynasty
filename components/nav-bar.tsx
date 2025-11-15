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
                                <Avatar className="w-9 h-9 border border-white/20 hover:border-[#b90505]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#b90505]/20">
                                    <AvatarImage src={session.user.image || ""} alt={session.user.name || "Uživatel"} />
                                    <AvatarFallback className="bg-gradient-to-br from-[#b90505] to-[#8a0101] text-foreground dark:text-white font-bold">
                                        {session.user.name?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel className="text-foreground dark:text-white font-medium">
                                    {session.user.name}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                
                                <MotionHighlight
                                    hover
                                    controlledItems
                                    className="bg-gradient-to-r from-[#b90505]/20 to-[#8a0101]/20 border border-[#b90505]/30 shadow-lg shadow-[#b90505]/10 rounded-lg"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                >
                                    <MotionHighlightItem 
                                        activeClassName={pathname.startsWith('/dashboard') ? 'bg-[#b90505]/20 border-[#b90505]/40' : ''}
                                        asChild
                                    >
                                        <Link href={siteConfig.links.dashboard}>
                                            <DropdownMenuItem className={`hover:cursor-pointer hover:bg-transparent focus:bg-transparent relative transition-all duration-200 ${
                                                pathname.startsWith('/dashboard') ? 'text-foreground dark:text-white bg-[#b90505]/10' : 'text-gray-300'
                                            }`}>
                                                <User className={`mr-2 h-4 w-4 transition-all duration-200 ${
                                                    pathname.startsWith('/dashboard') 
                                                        ? 'text-[#b90505] drop-shadow-[0_0_8px_#b90505]' 
                                                        : 'text-gray-400'
                                                }`} /> 
                                                Přehled
                                                {pathname.startsWith('/dashboard') && (
                                                    <div className="absolute right-2 w-2 h-2 bg-[#b90505] rounded-full shadow-[0_0_8px_#b90505]" />
                                                )}
                                            </DropdownMenuItem>
                                        </Link>
                                    </MotionHighlightItem>
                                    
                                    {isAdmin && (
                                        <>
                                            <DropdownMenuSeparator className="bg-white/10 my-1" />
                                            <MotionHighlightItem 
                                                activeClassName={pathname.startsWith('/admin') ? 'bg-[#b90505]/20 border-[#b90505]/40' : ''}
                                                asChild
                                            >
                                                <Link href="/admin">
                                                    <DropdownMenuItem className={`hover:cursor-pointer hover:bg-transparent focus:bg-transparent relative transition-all duration-200 ${
                                                        pathname.startsWith('/admin') ? 'text-foreground dark:text-white bg-[#b90505]/10' : 'text-gray-300'
                                                    }`}>
                                                        <Shield className={`mr-2 h-4 w-4 transition-all duration-200 ${
                                                            pathname.startsWith('/admin') 
                                                                ? 'text-[#b90505] drop-shadow-[0_0_8px_#b90505]' 
                                                                : 'text-gray-400'
                                                        }`} /> 
                                                        Admin Panel
                                                        {pathname.startsWith('/admin') && (
                                                            <div className="absolute right-2 w-2 h-2 bg-[#b90505] rounded-full shadow-[0_0_8px_#b90505]" />
                                                        )}
                                                    </DropdownMenuItem>
                                                </Link>
                                            </MotionHighlightItem>
                                        </>
                                    )}
                                    
                                </MotionHighlight>
                                
                                <DropdownMenuSeparator className="bg-white/10 my-1" />
                                <DropdownMenuItem 
                                    onClick={handleLogout} 
                                    className='hover:cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/20 focus:bg-red-500/20 transition-all duration-200'
                                    variant="destructive"
                                >
                                    <LogOut className="mr-2 h-4 w-4 text-red-400" /> 
                                    Odhlásit se
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild variant="outline" className="text-foreground dark:text-white border-white/50 hover:bg-white/10">
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
                                    <Avatar className="w-10 h-10 self-center border border-white/20 hover:border-[#b90505]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#b90505]/20">
                                        <AvatarImage src={session.user.image || ""} alt={session.user.name || "Uživatel"} />
                                        <AvatarFallback className="bg-gradient-to-br from-[#b90505] to-[#8a0101] text-foreground dark:text-white font-bold">
                                            {session.user.name?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel className="text-foreground dark:text-white font-medium">
                                        {session.user.name}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    
                                    <MotionHighlight
                                        hover
                                        controlledItems
                                        className="bg-gradient-to-r from-[#b90505]/20 to-[#8a0101]/20 border border-[#b90505]/30 shadow-lg shadow-[#b90505]/10 rounded-lg"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    >
                                        <MotionHighlightItem 
                                            activeClassName={pathname.startsWith('/dashboard') ? 'bg-[#b90505]/20 border-[#b90505]/40' : ''}
                                            asChild
                                        >
                                            <Link href={siteConfig.links.dashboard}>
                                                <DropdownMenuItem 
                                                    onClick={() => setIsMobileMenuOpen(false)} 
                                                    className={`hover:cursor-pointer hover:bg-transparent focus:bg-transparent relative transition-all duration-200 ${
                                                        pathname.startsWith('/dashboard') ? 'text-foreground dark:text-white bg-[#b90505]/10' : 'text-gray-300'
                                                    }`}
                                                >
                                                    <User className={`mr-2 h-4 w-4 transition-all duration-200 ${
                                                        pathname.startsWith('/dashboard') 
                                                            ? 'text-[#b90505] drop-shadow-[0_0_8px_#b90505]' 
                                                            : 'text-gray-400'
                                                    }`} /> 
                                                    Přehled
                                                    {pathname.startsWith('/dashboard') && (
                                                        <div className="absolute right-2 w-2 h-2 bg-[#b90505] rounded-full shadow-[0_0_8px_#b90505]" />
                                                    )}
                                                </DropdownMenuItem>
                                            </Link>
                                        </MotionHighlightItem>
                                        
                                        {isAdmin && (
                                            <>
                                                <DropdownMenuSeparator className="bg-white/10 my-1" />
                                                <MotionHighlightItem 
                                                    activeClassName={pathname.startsWith('/admin') ? 'bg-[#b90505]/20 border-[#b90505]/40' : ''}
                                                    asChild
                                                >
                                                    <Link href="/admin">
                                                        <DropdownMenuItem 
                                                            onClick={() => setIsMobileMenuOpen(false)} 
                                                            className={`hover:cursor-pointer hover:bg-transparent focus:bg-transparent relative transition-all duration-200 ${
                                                                pathname.startsWith('/admin') ? 'text-foreground dark:text-white bg-[#b90505]/10' : 'text-gray-300'
                                                            }`}
                                                        >
                                                            <Shield className={`mr-2 h-4 w-4 transition-all duration-200 ${
                                                                pathname.startsWith('/admin') 
                                                                    ? 'text-[#b90505] drop-shadow-[0_0_8px_#b90505]' 
                                                                    : 'text-gray-400'
                                                            }`} /> 
                                                            Admin Panel
                                                            {pathname.startsWith('/admin') && (
                                                                <div className="absolute right-2 w-2 h-2 bg-[#b90505] rounded-full shadow-[0_0_8px_#b90505]" />
                                                            )}
                                                        </DropdownMenuItem>
                                                    </Link>
                                                </MotionHighlightItem>
                                            </>
                                        )}
                                        
                                    </MotionHighlight>
                                    
                                    <DropdownMenuSeparator className="bg-white/10 my-1" />
                                    <DropdownMenuItem 
                                        onClick={handleLogout} 
                                        className='hover:cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/20 focus:bg-red-500/20 transition-all duration-200'
                                        variant="destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4 text-red-400" /> 
                                        Odhlásit se
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="outline" onClick={() => setIsMobileMenuOpen(false)} className="w-full hover:cursor-pointer">
                                <Link href="/sign-in">Přihlásit se</Link>
                            </Button>
                        )}
                    </div>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
}
