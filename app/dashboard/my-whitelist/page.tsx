'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/stateful-button'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, Calendar, User, RefreshCw, Copy, Eye } from 'lucide-react'
import { Icons } from '@/components/icons'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface WhitelistRequest {
    id: number
    form_data: string
    status: 'pending' | 'approved' | 'rejected'
    serial_number: string
    created_at: string
    updated_at: string
}

interface WhitelistData {
    requests: WhitelistRequest[]
    totalAttempts: number
    remainingAttempts: number
    maxAttempts: number
    activeRequest: WhitelistRequest | null
    canSubmitNew: boolean
    hasWhitelist: boolean
}

export default function MyWhitelistPage() {
    const [data, setData] = useState<WhitelistData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const router = useRouter()

    const fetchData = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true)
            
            const response = await fetch('/api/user/whitelist-requests')
            const result = await response.json()

            if (response.ok) {
                setData(result)
            } else {
                toast.error('Chyba při načítání žádostí', {
                    description: result.error || 'Došlo k neočekávané chybě'
                })
            }
        } catch (error) {
            console.error('Error fetching whitelist data:', error)
            toast.error('Chyba při načítání žádostí')
        } finally {
            if (showLoading) setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        return new Promise<void>(async (resolve, reject) => {
        try {
            const response = await fetch('/api/user/whitelist-requests')
            const result = await response.json()

            if (response.ok) {
                setData(result)
                    toast.success('Data úspěšně obnovena!')
                    resolve()
            } else {
                toast.error('Chyba při obnovování dat', {
                    description: result.error || 'Došlo k neočekávané chybě'
                })
                    reject(new Error(result.error))
            }
        } catch (error) {
            console.error('Error refreshing whitelist data:', error)
                toast.error('Chyba při obnovování dat')
                reject(error)
            }
            })
    }

    useEffect(() => {
        fetchData(true)
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
                        <Clock className="h-3 w-3 mr-1" />
                        Čeká se na vyhodnocení
                    </Badge>
                )
            case 'approved':
                return (
                    <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Schváleno
                    </Badge>
                )
            case 'rejected':
                return (
                    <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
                        <XCircle className="h-3 w-3 mr-1" />
                        Odmítnuto
                    </Badge>
                )
            default:
                return null
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('cs-CZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const parseFormData = (formDataString: string) => {
        try {
            return JSON.parse(formDataString)
        } catch {
            return null
        }
    }

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success(`${label} zkopírováno!`, {
                description: text,
                duration: 2000
            })
        } catch {
            toast.error('Nepodařilo se zkopírovat')
        }
    }

    if (isLoading || isRefreshing) {
        return (
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="animate-pulse">
                    <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 bg-white/5 mb-2" />
                    <Skeleton className="h-4 w-32 sm:w-48 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-20 sm:h-24 bg-white/5 rounded-lg" />
                    ))}
                </div>
                <Skeleton className="h-80 sm:h-96 bg-white/5 rounded-lg" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400">Chyba při načítání dat</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <h1 className="text-xl sm:text-2xl font-bold text-white">Moje Whitelist žádosti</h1>
                        {data.hasWhitelist && (
                            <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10 w-fit">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Máte Whitelist
                            </Badge>
                        )}
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base">Přehled vašich žádostí o přístup na server</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        onClick={handleRefresh}
                        className="border-[#b90505]/30 text-[#bd2727] hover:bg-[#b90505]/10 bg-transparent w-full sm:w-auto"
                    >
                        Obnovit
                    </Button>
                        <button
                            onClick={() => router.push('/whitelist')}
                        className="bg-[#b90505] hover:bg-[#a00404] text-white w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                        disabled={!data.canSubmitNew || data.hasWhitelist}
                        >
                        <FileText className="h-4 w-4" />
                        {data.hasWhitelist ? 'Již máte whitelist' : 'Podat novou žádost'}
                        </button>
                </div>
            </div>

            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Card className="bg-gradient-to-br from-blue-950/30 via-blue-900/30 to-blue-950/30 border-blue-500/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-blue-400 text-sm font-medium flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Celkem pokusů
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-300">
                            {data.totalAttempts} / {data.maxAttempts}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-950/30 via-green-900/30 to-green-950/30 border-green-500/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-green-400 text-sm font-medium flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Zbývající pokusy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-300">{data.remainingAttempts}</div>
                    </CardContent>
                </Card>

                <Card className={`bg-gradient-to-br ${
                    data.activeRequest 
                        ? 'from-yellow-950/30 via-yellow-900/30 to-yellow-950/30 border-yellow-500/20' 
                        : 'from-gray-950/30 via-gray-900/30 to-gray-950/30 border-gray-500/20'
                }`}>
                    <CardHeader className="pb-3">
                        <CardTitle className={`text-sm font-medium flex items-center ${
                            data.activeRequest ? 'text-yellow-400' : 'text-gray-400'
                        }`}>
                            <Clock className="h-4 w-4 mr-2" />
                            Aktivní žádost
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${
                            data.activeRequest ? 'text-yellow-300' : 'text-gray-400'
                        }`}>
                            {data.activeRequest ? 'Ano' : 'Ne'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            
            {data.remainingAttempts === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 sm:p-4 bg-red-950/30 border border-red-500/30 rounded-lg"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <div>
                            <h3 className="text-red-400 font-medium text-sm sm:text-base">Limit pokusů dosažen</h3>
                            <p className="text-red-300 text-xs sm:text-sm">
                                Vyčerpali jste všechny {data.maxAttempts} pokusy na whitelist žádost. 
                                Nemůžete podat další žádost.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            
            {data.hasWhitelist && data.requests.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 sm:p-4 bg-green-950/30 border border-green-500/30 rounded-lg"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <div>
                            <h3 className="text-green-400 font-medium text-sm sm:text-base">Whitelist aktivní</h3>
                            <p className="text-green-300 text-xs sm:text-sm">
                                Váš whitelist je aktivní a můžete se připojit na server. 
                                {data.requests.find(r => r.status === 'approved') && ' Vaše žádost byla schválena.'}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            
            <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-white">Historie žádostí</CardTitle>
                    <CardDescription>
                        Seznam všech vašich whitelist žádostí
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {data.requests.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 px-4">
                            <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                            <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                                {data.hasWhitelist ? 
                                    'Automaticky byla vytvořena schválená žádost' : 
                                    'Zatím jste nepodali žádnou whitelist žádost'
                                }
                            </p>
                                <button
                                    onClick={() => router.push('/whitelist')}
                                className="bg-[#b90505] hover:bg-[#a00404] text-white w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-md text-sm font-medium"
                                disabled={!data.canSubmitNew || data.hasWhitelist}
                                >
                                {data.hasWhitelist ? 'Již máte whitelist' : 'Podat první žádost'}
                                </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.requests.map((request, index) => {
                                const formData = parseFormData(request.form_data)
                                return (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex flex-col gap-4">
                                            
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        <span className="text-white font-medium">Žádost #{request.id}</span>
                                                        <button
                                                            onClick={() => copyToClipboard(request.id.toString(), 'ID žádosti')}
                                                            className="p-1 rounded hover:bg-white/10 transition-colors group"
                                                            title="Kopírovat ID"
                                                        >
                                                            <Copy className="h-3 w-3 text-gray-400 group-hover:text-white" />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                        {request.serial_number && (
                                                            <div className="flex items-center gap-1">
                                                                <FileText className="h-3 w-3 text-[#bd2727]" />
                                                                <span className="text-[#bd2727] text-sm font-mono font-semibold">
                                                                    {request.serial_number}
                                                                </span>
                                                                <button
                                                                    onClick={() => copyToClipboard(request.serial_number, 'Seriové číslo')}
                                                                    className="p-1 rounded hover:bg-[#b90505]/20 transition-colors group"
                                                                    title="Kopírovat seriové číslo"
                                                                >
                                                                    <Copy className="h-3 w-3 text-[#bd2727]/60 group-hover:text-[#bd2727]" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        <p className="text-gray-400 text-sm flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(request.created_at)}
                                                </p>
                                            </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                                                        <button
                                                        onClick={() => router.push(`/dashboard/whitelist-detail/${request.id}`)}
                                        className="border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-transparent"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        <span className="hidden sm:inline">Detail</span>
                                    </button>
                                            {getStatusBadge(request.status)}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {formData && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                                                <div className="space-y-1">
                                                    <span className="text-gray-400 text-xs uppercase tracking-wide">Discord:</span>
                                                    <p className="text-white font-medium">{formData.discordName || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-gray-400 text-xs uppercase tracking-wide">Věk:</span>
                                                    <p className="text-white font-medium">{formData.age || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-gray-400 text-xs uppercase tracking-wide">FiveM hodiny:</span>
                                                    <p className="text-white font-medium">{formData.fivemHours || 'N/A'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 