'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SidebarNav } from '@/components/sidebar-nav'
import {
    Settings,
    Activity,
    FileText,
    Shield,
    Users,
    BarChart3,
    LogOut,
    Crown
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const adminNavItems = [
    {
        href: '/admin',
        icon: BarChart3,
        title: 'Přehled'
    },
    {
        href: '/admin/activities',
        icon: Activity,
        title: 'Aktivity'
    },
    {
        href: '/admin/rules',
        icon: FileText,
        title: 'Pravidla'
    },
    {
        href: '/admin/whitelist-questions',
        icon: Shield,
        title: 'Whitelist otázky'
    },
    {
        href: '/admin/users',
        icon: Users,
        title: 'Uživatelé'
    },
    {
        href: '/admin/settings',
        icon: Settings,
        title: 'Nastavení'
    }
]

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Check admin permissions
    useEffect(() => {
        const checkAdminAccess = async () => {
            try {
                const response = await fetch('/api/user/me')
                if (!response.ok) {
                    router.push('/sign-in')
                    return
                }

                const userData = await response.json()
                
                // Check if user has admin role
                if (!userData.permissions?.isAdmin) {
                    toast.error('Nemáš oprávnění pro přístup do admin panelu!')
                    router.push('/dashboard')
                    return
                }

                setUser(userData)
            } catch (error) {
                console.error('Admin access check failed:', error)
                router.push('/sign-in')
            } finally {
                setIsLoading(false)
            }
        }

        checkAdminAccess()
    }, [router])

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/sign-out', { method: 'POST' })
            router.push('/')
            toast.success('Byl jsi odhlášen')
        } catch (error) {
            toast.error('Chyba při odhlašování')
        }
    }

    if (isLoading) {
        return (
            <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a]">
                {/* Background effects */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[300px] w-[400px] md:h-[400px] md:w-[600px] rounded-full bg-[#b90505]/8 blur-3xl" />
                </div>

                <div className="relative z-10 container mx-auto max-w-7xl py-4 sm:py-6 lg:py-10 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-[#b90505] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-400">Načítání admin panelu...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a]">
            {/* Background effects */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[300px] w-[400px] md:h-[400px] md:w-[600px] rounded-full bg-[#b90505]/8 blur-3xl" />
            </div>

            <div className="relative z-10 container mx-auto max-w-7xl py-4 sm:py-6 lg:py-10 px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="space-y-6 sm:space-y-8"
                >
                    {/* Header - identical to dashboard */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 sm:mb-6 lg:mb-8">
                        <div className="text-center sm:text-left">
                            <Badge
                                variant="outline"
                                className="border-[#b90505]/60 text-[#bd2727] bg-[#b90505]/10 px-3 py-1 sm:px-4 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur flex gap-2"
                            >
                                <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-[#bd2727] drop-shadow-[0_0_5px_#bd2727]" />
                                <span className="truncate max-w-[120px] sm:max-w-none">{user?.username || 'Admin'}</span>
                            </Badge>
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground dark:text-white mt-2 mb-1 sm:mb-2">Admin Panel</h1>
                            <p className="text-xs sm:text-sm lg:text-base text-gray-400">Správa Retrovax FiveM serveru</p>
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
                        {/* Sidebar - Always visible like dashboard */}
                        <motion.aside
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            className="w-full lg:w-64 flex-shrink-0"
                        >
                            <div className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 rounded-2xl backdrop-blur-md p-3 sm:p-4 lg:p-6">
                                <SidebarNav items={adminNavItems} />
                            </div>
                        </motion.aside>

                        {/* Main content - identical to dashboard */}
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
    )
} 