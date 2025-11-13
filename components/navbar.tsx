"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Moon, Sun, User, Settings, LogOut } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { siteConfig } from "@/config/site"
import { useSession, signOut } from "@/lib/auth-client"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { data: session } = useSession()

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
    router.push("/")
  }

  const user = session?.user
  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || user?.email?.[0]?.toUpperCase() || "U"

  const navItems = [
    { label: "Domů", href: siteConfig.links.home },
    { label: "Aplikace", href: siteConfig.links.application },
    { label: "Pravidla", href: siteConfig.links.rules },
    { label: "Tým", href: siteConfig.links.team },
    { label: "Statistiky", href: siteConfig.links.statistics },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 transition-all duration-500 px-4">
      <div
        className={cn(
          "relative mx-auto max-w-6xl w-full px-8 py-2.5 rounded-lg transition-all duration-500",
          "backdrop-blur-2xl backdrop-saturate-180",
          "border border-white/20 dark:border-white/10",
          "shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
          isScrolled
            ? "bg-linear-to-br from-white/80 via-white/70 to-white/60 dark:from-black/60 dark:via-black/50 dark:to-black/40"
            : "bg-linear-to-br from-white/60 via-white/50 to-white/40 dark:from-black/50 dark:via-black/40 dark:to-black/30"
        )}
      >
        {/* Shine overlay effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg pointer-events-none",
            "bg-linear-to-br from-white/30 via-transparent to-transparent",
            "dark:from-white/10 dark:via-transparent dark:to-transparent",
            "opacity-60 dark:opacity-40"
          )}
        />
        {/* Content wrapper */}
        <div className="relative flex h-10 items-center justify-between z-10">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-foreground transition-all duration-300 hover:scale-105 hover:text-primary"
          >
            <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg",
                  "hover:bg-accent/60 hover:text-accent-foreground hover:scale-105",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative h-9 w-9"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Auth Button or Avatar */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full transition-all duration-300 hover:scale-105"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || "Uživatel"}
                      </p>
                      {user.email && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={siteConfig.links.dashboard} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Nastavení</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Odhlásit se</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                className="hidden sm:inline-flex transition-all duration-300 hover:scale-105"
                size="sm"
              >
                <Link href="/auth">Přihlásit se</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9 transition-all duration-300 hover:scale-105"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[320px] sm:w-[380px] bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-l-2xl"
              >
                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "px-4 py-3 text-base font-medium rounded-lg transition-colors",
                          "hover:bg-accent/50 hover:text-accent-foreground",
                          isActive(item.href)
                            ? "text-primary bg-accent/30"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    {user ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-accent/30">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{user.name || "Uživatel"}</span>
                            {user.email && (
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            )}
                          </div>
                        </div>
                        <Link
                          href={siteConfig.links.dashboard}
                          className="px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent/50 hover:text-accent-foreground text-muted-foreground"
                        >
                          Profil
                        </Link>
                        <Link
                          href="/settings"
                          className="px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent/50 hover:text-accent-foreground text-muted-foreground"
                        >
                          Nastavení
                        </Link>
                        <Button
                          onClick={handleSignOut}
                          variant="destructive"
                          className="w-full mt-2"
                          size="lg"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Odhlásit se
                        </Button>
                      </div>
                    ) : (
                      <Button
                        asChild
                        className="w-full"
                        size="lg"
                      >
                        <Link href="/auth">Přihlásit se</Link>
                      </Button>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between px-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        Téma
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                        className="relative h-9 w-9"
                      >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

