'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Activity,
    FileText,
    Users,
    Shield,
    TrendingUp,
    Clock,
    CheckCircle,
    Edit3,
    Plus,
    BarChart3,
    Zap,
    Globe,
    Crown
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface DashboardStats {
    totalActivities: number
    totalRules: number
    totalUsers: number
    onlineUsers: number
    whitelistRequests: number
    recentActivity: string
}

export default function AdminDashboard() {
    const [stats] = useState<DashboardStats>({
        totalActivities: 7,
        totalRules: 3,
        totalUsers: 2000,
        onlineUsers: 350,
        whitelistRequests: 12,
        recentActivity: '2 minuty'
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simulate loading dashboard data
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const dashboardCards = [
        {
            title: 'Celkem aktivit',
            value: stats.totalActivities,
            icon: Activity,
            color: 'text-blue-400',
            bgColor: 'from-blue-500/20 to-blue-600/20',
            borderColor: 'border-blue-500/30',
            description: 'Herní aktivity na serveru',
            link: '/admin/activities'
        },
        {
            title: 'Pravidla',
            value: stats.totalRules,
            icon: FileText,
            color: 'text-green-400',
            bgColor: 'from-green-500/20 to-green-600/20',
            borderColor: 'border-green-500/30',
            description: 'Sekce pravidel',
            link: '/admin/rules'
        },
        {
            title: 'Registrovaní uživatelé',
            value: `${stats.totalUsers}+`,
            icon: Users,
            color: 'text-purple-400',
            bgColor: 'from-purple-500/20 to-purple-600/20',
            borderColor: 'border-purple-500/30',
            description: 'Celkový počet účtů',
            link: '/admin/users'
        },
        {
            title: 'Online hráči',
            value: stats.onlineUsers,
            icon: Globe,
            color: 'text-orange-400',
            bgColor: 'from-orange-500/20 to-orange-600/20',
            borderColor: 'border-orange-500/30',
            description: 'Momentálně připojení',
            link: '/dashboard'
        },
        {
            title: 'Whitelist žádosti',
            value: stats.whitelistRequests,
            icon: Shield,
            color: 'text-red-400',
            bgColor: 'from-red-500/20 to-red-600/20',
            borderColor: 'border-red-500/30',
            description: 'Čekající na schválení',
            link: '/dashboard/whitelist'
        },
        {
            title: 'Poslední aktivita',
            value: stats.recentActivity,
            icon: Clock,
            color: 'text-yellow-400',
            bgColor: 'from-yellow-500/20 to-yellow-600/20',
            borderColor: 'border-yellow-500/30',
            description: 'Před chvílí',
            link: '/admin'
        }
    ]

    const quickActions = [
        {
            title: 'Přidat aktivitu',
            description: 'Vytvořit novou herní aktivitu',
            icon: Plus,
            href: '/admin/activities/new',
            color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        },
        {
            title: 'Upravit pravidla',
            description: 'Spravovat pravidla serveru',
            icon: Edit3,
            href: '/admin/rules',
            color: 'bg-green-500/20 text-green-400 border-green-500/30'
        },
        {
            title: 'Správa uživatelů',
            description: 'Spravovat uživatelské účty',
            icon: Users,
            href: '/admin/users',
            color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        },
        {
            title: 'Whitelist správa',
            description: 'Spravovat whitelist žádosti',
            icon: Shield,
            href: '/dashboard/whitelist',
            color: 'bg-red-500/20 text-red-400 border-red-500/30'
        }
    ]

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 animate-pulse">
                        <CardContent className="p-4 sm:p-6">
                            <div className="h-3 sm:h-4 bg-white/20 rounded mb-3 sm:mb-4"></div>
                            <div className="h-6 sm:h-8 bg-white/10 rounded mb-2"></div>
                            <div className="h-2 sm:h-3 bg-white/5 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[#b90505]/20 to-[#bd2727]/10 text-[#bd2727] border border-[#b90505]/30 shadow-lg">
                            <Crown className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-400 mt-1">
                                Správa Retrovax FiveM serveru
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-400">
                        Systém běží stabilně • Posledních 24h bez problémů
                    </span>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12"
            >
                {dashboardCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Link href={card.link}>
                            <Card className={`bg-gradient-to-br from-white/5 to-white/[0.02] border ${card.borderColor} hover:border-opacity-80 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:shadow-black/20 hover:scale-105 h-full`}>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${card.bgColor} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <card.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                                        </div>
                                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 opacity-60" />
                                    </div>
                                    <div className="space-y-1 sm:space-y-2">
                                        <h3 className="text-xs sm:text-sm font-medium text-gray-400 break-words">{card.title}</h3>
                                        <p className="text-xl sm:text-2xl font-bold text-white">{card.value}</p>
                                        <p className="text-xs text-gray-500 break-words">{card.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8 sm:mb-12"
            >
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-[#bd2727] flex-shrink-0" />
                    <h2 className="text-lg sm:text-xl font-bold text-white">Rychlé akce</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {quickActions.map((action, index) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <Link href={action.href}>
                                <Card className={`${action.color} border transition-all duration-300 group cursor-pointer hover:shadow-lg hover:scale-105 h-full`}>
                                    <CardContent className="p-4 sm:p-6 text-center">
                                        <div className="flex justify-center mb-3 sm:mb-4">
                                            <action.icon className="h-6 w-6 sm:h-8 sm:w-8 group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        <h3 className="font-semibold mb-2 text-sm sm:text-base break-words">{action.title}</h3>
                                        <p className="text-xs sm:text-sm opacity-80 break-words">{action.description}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-[#bd2727] flex-shrink-0" />
                    <h2 className="text-lg sm:text-xl font-bold text-white">Stav systému</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30">
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="flex items-center gap-2 text-green-400 text-base sm:text-lg">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                Server Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm sm:text-base">FiveM Server</span>
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Online</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm sm:text-base">Database</span>
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Connected</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm sm:text-base">Discord Bot</span>
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Active</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30">
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="flex items-center gap-2 text-blue-400 text-base sm:text-lg">
                                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                                Rychlé informace
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm sm:text-base">Uptime</span>
                                    <span className="text-white font-medium text-sm sm:text-base">99.8%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm sm:text-base">Avg. Response</span>
                                    <span className="text-white font-medium text-sm sm:text-base">&lt; 50ms</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm sm:text-base">Memory Usage</span>
                                    <span className="text-white font-medium text-sm sm:text-base">2.1GB</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </>
    )
} 