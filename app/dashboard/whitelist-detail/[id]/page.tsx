'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle, 
    FileText, 
    Calendar, 
    User, 
    ArrowLeft,
    Copy,
    Save,
    MessageSquare,
    Eye,
    Edit3
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface WhitelistRequest {
    id: number
    user_id: string
    form_data: string
    status: 'pending' | 'approved' | 'rejected'
    serial_number: string
    notes: string | null
    created_at: string
    updated_at: string
}

interface FormData {
    discordName: string
    age: string
    steamProfile: string
    fivemHours: string
    whyJoinServer: string
    howFoundUs: string
    whatIsRoleplay: string
    icVsOoc: string
    meCommand: string
    doCommand: string
    whatIsKos: string
    whatIsMetagaming: string
    whatIsMixing: string
    whatIsPowergaming: string
    fearRp: string
    grossRp: string
    waterEvading: string
    copBaiting: string
    passiveRp: string
    nvl: string
    vdm: string
    rdm: string
    advertising: string
    failRp: string
    lootboxing: string
    robbery: string
    inventory: string
    pk: string
    ck: string
    rvdm: string
    combatComeback: string
    sprayingRules: string
    personRecognition: string
    kidnappingRules: string
    scenario1: string
    scenario2: string
    rules: boolean
}

export default function WhitelistDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [request, setRequest] = useState<WhitelistRequest | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [notes, setNotes] = useState('')
    const [isSavingNotes, setIsSavingNotes] = useState(false)
    const [canManageNotes, setCanManageNotes] = useState(false)

    const fetchRequest = async () => {
        try {
            const response = await fetch(`/api/whitelist-detail/${params.id}`)
            const data = await response.json()

            if (response.ok) {
                setRequest(data.request)
                setNotes(data.request.notes || '')
                setCanManageNotes(data.canManageNotes)
            } else {
                toast.error('Chyba při načítání žádosti', {
                    description: data.error || 'Došlo k neočekávané chybě'
                })
                router.push('/dashboard/my-whitelist')
            }
        } catch (error) {
            console.error('Error fetching request:', error)
            toast.error('Chyba při načítání žádosti')
            router.push('/dashboard/my-whitelist')
        } finally {
            setIsLoading(false)
        }
    }

    const saveNotes = async () => {
        if (!canManageNotes || !request) return

        setIsSavingNotes(true)
        try {
            const response = await fetch(`/api/whitelist-detail/${request.id}/notes`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes })
            })

            if (response.ok) {
                toast.success('Poznámky uloženy')
                setRequest(prev => prev ? { ...prev, notes } : null)
            } else {
                const data = await response.json()
                toast.error('Chyba při ukládání poznámek', {
                    description: data.error
                })
            }
        } catch (error) {
            console.error('Error saving notes:', error)
            toast.error('Chyba při ukládání poznámek')
        } finally {
            setIsSavingNotes(false)
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

    useEffect(() => {
        fetchRequest()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id])

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

    const parseFormData = (formDataString: string): FormData | null => {
        try {
            return JSON.parse(formDataString)
        } catch {
            return null
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-8 w-64 bg-white/5" />
                <div className="grid gap-6">
                    <Skeleton className="h-64 bg-white/5 rounded-lg" />
                    <Skeleton className="h-96 bg-white/5 rounded-lg" />
                </div>
            </div>
        )
    }

    if (!request) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400">Žádost nenalezena</p>
            </div>
        )
    }

    const formData = parseFormData(request.form_data)

    if (!formData) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400">Chyba při načítání dat formuláře</p>
            </div>
        )
    }

    const FormField = ({ label, value, isTextarea = false }: { label: string; value: string; isTextarea?: boolean }) => (
        <div className="space-y-2">
            <label className="text-foreground dark:text-white font-medium text-sm">{label}</label>
            <div className="flex items-start gap-2">
                {isTextarea ? (
                    <div className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-foreground dark:text-white text-sm whitespace-pre-wrap break-words min-h-[60px] max-h-40 overflow-y-auto">
                        {value}
                    </div>
                ) : (
                    <div className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-foreground dark:text-white text-sm break-words">
                        {value}
                    </div>
                )}
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs whitespace-nowrap flex-shrink-0 mt-1">
                    {value?.length || 0} znaků
                </Badge>
            </div>
        </div>
    )

    return (
        <div className="space-y-6 p-6 max-w-6xl mx-auto">
            
            <div className="flex items-center gap-4">
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    size="sm"
                    className="border-[#b90505]/30 text-[#bd2727] hover:bg-[#b90505]/10"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zpět
                </Button>
                
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-6 w-6 text-[#bd2727]" />
                        <h1 className="text-2xl font-bold text-foreground dark:text-white">Detail whitelist žádosti</h1>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">ID:</span>
                            <span className="text-foreground dark:text-white font-mono">#{request.id}</span>
                            <button
                                onClick={() => copyToClipboard(request.id.toString(), 'ID žádosti')}
                                className="p-1 rounded hover:bg-white/10 transition-colors"
                                title="Kopírovat ID"
                            >
                                <Copy className="h-3 w-3 text-gray-400 hover:text-foreground dark:text-white" />
                            </button>
                        </div>
                        
                        {request.serial_number && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">Seriové číslo:</span>
                                <span className="text-[#bd2727] font-mono font-semibold">{request.serial_number}</span>
                                <button
                                    onClick={() => copyToClipboard(request.serial_number, 'Seriové číslo')}
                                    className="p-1 rounded hover:bg-[#b90505]/20 transition-colors"
                                    title="Kopírovat seriové číslo"
                                >
                                    <Copy className="h-3 w-3 text-[#bd2727]/60 hover:text-[#bd2727]" />
                                </button>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-400">{formatDate(request.created_at)}</span>
                        </div>
                        
                        {getStatusBadge(request.status)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    
                    <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Základní informace
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Discord jméno" value={formData.discordName} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Věk" value={formData.age} />
                                <FormField label="FiveM hodiny" value={formData.fivemHours} />
                            </div>
                            
                            <FormField label="Steam profil" value={formData.steamProfile} />
                            <FormField label="Proč náš server?" value={formData.whyJoinServer} isTextarea={true} />
                            <FormField label="Odkud o nás víš?" value={formData.howFoundUs} />
                        </CardContent>
                    </Card>

                    
                    <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Znalost RP pravidel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Co je to Roleplay?" value={formData.whatIsRoleplay} isTextarea={true} />
                            <FormField label="IC vs OOC rozdíl" value={formData.icVsOoc} isTextarea={true} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="/me příkaz" value={formData.meCommand} isTextarea={true} />
                                <FormField label="/do příkaz" value={formData.doCommand} isTextarea={true} />
                            </div>
                        </CardContent>
                    </Card>

                    
                    <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Znalost pravidel serveru
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Co je KOS?" value={formData.whatIsKos} isTextarea={true} />
                                <FormField label="Co je Metagaming?" value={formData.whatIsMetagaming} isTextarea={true} />
                                <FormField label="Co je Mixing?" value={formData.whatIsMixing} isTextarea={true} />
                                <FormField label="Co je Powergaming?" value={formData.whatIsPowergaming} isTextarea={true} />
                                <FormField label="Fear RP" value={formData.fearRp} isTextarea={true} />
                                <FormField label="VDM" value={formData.vdm} isTextarea={true} />
                                <FormField label="RDM" value={formData.rdm} isTextarea={true} />
                                <FormField label="NVL" value={formData.nvl} isTextarea={true} />
                            </div>
                        </CardContent>
                    </Card>

                    
                    <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Scénáře
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Scénář 1" value={formData.scenario1} isTextarea={true} />
                            <FormField label="Scénář 2" value={formData.scenario2} isTextarea={true} />
                        </CardContent>
                    </Card>
                </div>

                
                <div className="space-y-6">
                    
                    <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-foreground dark:text-white text-lg">Status žádosti</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-center">
                                {getStatusBadge(request.status)}
                            </div>
                            
                            <div className="text-center text-sm text-gray-400">
                                <p>Vytvořeno: {formatDate(request.created_at)}</p>
                                <p>Aktualizováno: {formatDate(request.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    
                    <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                                <Edit3 className="h-5 w-5" />
                                Poznámky správce
                            </CardTitle>
                            <CardDescription>
                                {canManageNotes ? 'Můžete upravit poznámky' : 'Pouze ke čtení'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                value={notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                                placeholder={canManageNotes ? "Zadejte poznámky k této žádosti..." : "Žádné poznámky"}
                                className="min-h-[120px] bg-white/5 border-white/10 text-foreground dark:text-white"
                                disabled={!canManageNotes}
                            />
                            
                            {canManageNotes && (
                                <Button
                                    onClick={saveNotes}
                                    disabled={isSavingNotes || notes === (request.notes || '')}
                                    className="w-full bg-[#b90505] hover:bg-[#a00404] text-foreground dark:text-white"
                                >
                                    {isSavingNotes ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="mr-2"
                                            >
                                                <Save className="h-4 w-4" />
                                            </motion.div>
                                            Ukládám...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Uložit poznámky
                                        </>
                                    )}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
} 