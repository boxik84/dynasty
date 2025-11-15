'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { InView } from '@/components/motion-primitives/in-view'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Crown, UserCog, Code2, Shield } from "lucide-react"

interface Member {
    id: string
    username: string
    avatar: string | null
}

interface Group {
    label: string
    members: Member[]
    loading: boolean
    error: string | null
}

const TEAM_ROLES: { id: string; label: string; icon: any; color: string }[] = [
    { id: '1383380551444074594', label: 'Project Owner', icon: Crown, color: 'from-[#b90505] via-red-500 to-[#bd2727]' },
    { id: '1383380551444074593', label: 'Vedení', icon: UserCog, color: 'from-[#b90505] via-red-400 to-[#bd2727]' },
    { id: '1383380551444074591', label: 'Staff Team', icon: Shield, color: 'from-red-600 via-[#b90505] to-red-400' },
    { id: '1383380551444074590', label: 'Developer Team', icon: Code2, color: 'from-red-700 via-[#b90505] to-red-400' },
]

export default function TeamPage() {
    const [groups, setGroups] = useState<Group[]>(
        TEAM_ROLES.map(role => ({ label: role.label, members: [], loading: true, error: null }))
    )

    useEffect(() => {
        const fetchMembers = async () => {
            const promises = TEAM_ROLES.map(async (role, idx) => {
                try {
                    const response = await fetch(`/api/members-by-role?roleId=${role.id}`)
                    const data = await response.json()

                    if (!response.ok) {
                        throw new Error(data.error || 'Nepodařilo se načíst členy')
                    }

                    return { idx, members: data.members as Member[], error: null }
                } catch (err) {
                    return { idx, members: [], error: err instanceof Error ? err.message : 'Neznámá chyba' }
                }
            })

            const results = await Promise.all(promises)

            setGroups(prev => {
                const updated = [...prev]
                results.forEach(({ idx, members, error }) => {
                    updated[idx] = { ...updated[idx], members, error, loading: false }
                })
                return updated
            })
        }

        fetchMembers()
    }, [])

    return (
        <section className="relative min-h-screen bg-[#0a0a0a] py-28 flex flex-col items-center overflow-hidden">
            
            <div className="pointer-events-none absolute left-1/2 top-0 z-0 -translate-x-1/2">
                <div className="h-[400px] w-[1200px] rounded-full bg-[#b90505]/20 blur-3xl" />
            </div>
            <div className="pointer-events-none absolute left-2/3 top-3/4 z-0 -translate-x-1/2 -translate-y-1/2">
                <div className="h-[200px] w-[400px] rounded-full bg-[#b90505]/20 blur-3xl" />
            </div>
            <div className="pointer-events-none absolute left-1/4 bottom-20 z-0 -translate-x-1/2">
                <div className="h-[200px] w-[400px] rounded-full bg-red-400/10 blur-3xl" />
            </div>
            <div className="pointer-events-none absolute right-0 bottom-0 z-0">
                <div className="h-[140px] w-[240px] rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
                
                <div className="flex justify-center items-center mb-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#b90505]/10 border border-[#b90505]/30 text-[#bd2727] px-4 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
                        <Sparkles className="h-4 w-4 text-[#bd2727]" />
                        Náš tým
                    </span>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow">
                        Seznamte se s Retrovax FiveM týmem
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Administrace, moderace i vývoj – tým, díky kterému to žije.
                    </p>
                </motion.div>

                {groups.map((group, idx) => (
                    <Section
                        key={group.label}
                        label={group.label}
                        members={group.members}
                        loading={group.loading}
                        error={group.error}
                        delay={idx * 0.2}
                        icon={TEAM_ROLES[idx].icon}
                        badgeColor={TEAM_ROLES[idx].color}
                    />
                ))}
            </div>
        </section>
    )
}

interface SectionProps {
    label: string
    members: Member[]
    loading: boolean
    error: string | null
    delay: number
    icon: any
    badgeColor: string
}

const containerVariants = (delay = 0) => ({
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: delay } },
})

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        transition: { 
            type: 'spring' as const, 
            stiffness: 100, 
            damping: 22 
        } 
    },
}

function Section({ label, members, loading, error, delay, icon: Icon, badgeColor }: SectionProps) {
    return (
        <InView
            as="section"
            viewOptions={{ once: true, margin: '0px 0px -200px 0px' }}
            variants={containerVariants(delay)}
            transition={{ duration: 0.6 }}
        >
            
            <motion.div
                variants={itemVariants}
                className="flex justify-center mb-10 mt-16"
            >
                <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-base font-bold tracking-wide shadow-lg ring-1 ring-red-300/40 
                    bg-[#b90505]/10 text-white/90
                    backdrop-blur-xl select-none`}>
                    <Icon className="w-5 h-5 text-white/90 drop-shadow" />
                    {label}
                </span>
            </motion.div>

            {loading && <p className="text-center text-gray-400">Načítám…</p>}
            {error && <p className="text-center text-red-400">Chyba: {error}</p>}
            {!loading && !error && members.length === 0 && (
                <p className="text-center text-gray-500 mb-8">Žádní členové s rolí {label}.</p>
            )}

            {!loading && !error && members.length > 0 && (
                <motion.div
                    variants={containerVariants(0)}
                    className="flex flex-wrap justify-center gap-10"
                >
                    {members.map(member => (
                        <motion.div
                            key={member.id}
                            variants={itemVariants}
                            className="transform hover:scale-105 transition-transform"
                        >
                            <Card className="border-0 bg-white/5 shadow-2xl rounded-2xl backdrop-blur-md transition-all group relative overflow-hidden min-w-[240px]">
                                
                                <span className="absolute -inset-2 z-0 rounded-2xl bg-gradient-to-tr from-[#b90505]/10 via-[#b90505]/10 to-red-300/10 blur-2xl animate-pulse" />
                                <CardContent className="flex flex-col items-center p-7 relative z-10">
                                    <div className="relative mb-4">
                                        <span className="absolute inset-0 rounded-full ring-2 ring-[#b90505]/40 blur-md pointer-events-none animate-pulse" />
                                        <Avatar className="w-24 h-24 rounded-full ring-2 ring-[#b90505] shadow-lg group-hover:ring-[#b90505] transition-all">
                                            {member.avatar ? (
                                                <AvatarImage src={member.avatar} alt={member.username} />
                                            ) : (
                                                <AvatarFallback className="text-red-100 bg-[#b90505]/40 font-bold">
                                                    {member.username.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                    </div>
                                    <p className="mt-1 text-lg font-semibold text-center text-white tracking-wide">
                                        {member.username}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </InView>
    )
}
