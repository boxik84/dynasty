'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/stateful-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Settings,
    Server,
    Database,
    Shield,
    Palette,
    Globe,
    Save,
    AlertTriangle,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
    HardDrive,
    Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface BackupLog {
    id: number
    type: 'full' | 'structure' | 'data'
    filename: string
    file_size: number
    status: 'running' | 'completed' | 'failed'
    error_message?: string
    created_by: string
    created_at: string
}

interface BackupStats {
    totalBackups: number
    totalSize: string
    lastBackup: string | null
}

export default function SettingsAdmin() {
    const [settings, setSettings] = useState({
        serverName: 'Retrovax FiveM',
        serverDescription: 'Největší cz/sk FiveM server',
        maxPlayers: 350,
        whitelistEnabled: true,
        maintenanceMode: false,
        discordInvite: 'https://discord.gg/retrovax',
        websiteUrl: 'https://retrovax.eu',
        maintenanceMessage: 'Server je momentálně v údržbě. Zkuste to prosím později.',
        autoBackup: true,
        backupInterval: 'daily',
        logLevel: 'info'
    })

    const [isSaving, setIsSaving] = useState(false)
    const [backupHistory, setBackupHistory] = useState<BackupLog[]>([])
    const [backupStats, setBackupStats] = useState<BackupStats>({
        totalBackups: 0,
        totalSize: '0 MB',
        lastBackup: null
    })
    const [isCreatingBackup, setIsCreatingBackup] = useState(false)
    const [isLoadingBackups, setIsLoadingBackups] = useState(true)

    useEffect(() => {
        fetchBackupInfo()
    }, [])

    const fetchBackupInfo = async () => {
        return new Promise<void>(async (resolve, reject) => {
        try {
            const response = await fetch('/api/admin/backup')
            if (response.ok) {
                const data = await response.json()
                setBackupHistory(data.backupHistory || [])
                setBackupStats(data.statistics || {
                    totalBackups: 0,
                    totalSize: '0 MB',
                    lastBackup: null
                })
                    toast.success('Historie záloh obnovena')
                    resolve()
                } else {
                    toast.error('Chyba při načítání záloh')
                    reject(new Error('Failed to fetch backup info'))
            }
        } catch (error) {
            console.error('Error fetching backup info:', error)
                toast.error('Chyba při načítání záloh')
                reject(error)
        }
        })
    }

    const handleSave = async () => {
        setIsSaving(true)
        // Simulate saving
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsSaving(false)
        toast.success('Nastavení bylo uloženo!')
    }

    const createBackup = async (type: 'full' | 'structure' | 'data' = 'full') => {
        setIsCreatingBackup(true)
        try {
            const response = await fetch('/api/admin/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(`✅ ${data.message}`, {
                    description: `Soubor: ${data.filename} (${data.size})`
                })
                await fetchBackupInfo() // Refresh backup history
            } else {
                toast.error(`❌ Chyba při vytváření zálohy`, {
                    description: data.details || data.error
                })
            }
        } catch (error: any) {
            console.error('Backup error:', error)
            toast.error('❌ Chyba při vytváření zálohy', {
                description: error.message
            })
        } finally {
            setIsCreatingBackup(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-400" />
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-400" />
            case 'running':
                return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
            default:
                return <Clock className="h-4 w-4 text-gray-400" />
        }
    }

    const getBackupTypeColor = (type: string) => {
        switch (type) {
            case 'full':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'structure':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            case 'data':
                return 'bg-green-500/20 text-green-400 border-green-500/30'
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    const settingSections = [
        {
            title: 'Základní nastavení',
            icon: Server,
            settings: [
                {
                    key: 'serverName',
                    label: 'Název serveru',
                    type: 'text',
                    description: 'Oficiální název FiveM serveru'
                },
                {
                    key: 'serverDescription',
                    label: 'Popis serveru',
                    type: 'textarea',
                    description: 'Krátký popis serveru pro nové hráče'
                },
                {
                    key: 'maxPlayers',
                    label: 'Maximální počet hráčů',
                    type: 'number',
                    description: 'Maximální kapacita serveru'
                }
            ]
        },
        {
            title: 'Bezpečnost a přístup',
            icon: Shield,
            settings: [
                {
                    key: 'whitelistEnabled',
                    label: 'Whitelist povolen',
                    type: 'switch',
                    description: 'Vyžadovat whitelist pro připojení na server'
                },
                {
                    key: 'maintenanceMode',
                    label: 'Režim údržby',
                    type: 'switch',
                    description: 'Dočasně uzavřít server pro běžné hráče'
                },
                {
                    key: 'maintenanceMessage',
                    label: 'Zpráva při údržbě',
                    type: 'textarea',
                    description: 'Zpráva zobrazená hráčům během údržby'
                }
            ]
        },
        {
            title: 'Komunita a odkazy',
            icon: Globe,
            settings: [
                {
                    key: 'discordInvite',
                    label: 'Discord pozvánka',
                    type: 'text',
                    description: 'Odkaz na Discord server'
                },
                {
                    key: 'websiteUrl',
                    label: 'URL webu',
                    type: 'text',
                    description: 'Oficiální web serveru'
                }
            ]
        }
    ]

    const renderInput = (setting: any) => {
        const value = settings[setting.key as keyof typeof settings]

        switch (setting.type) {
            case 'switch':
                return (
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={value as boolean}
                            onCheckedChange={(checked) => 
                                setSettings(prev => ({ ...prev, [setting.key]: checked }))
                            }
                        />
                        <span className="text-sm text-gray-400">
                            {value ? 'Zapnuto' : 'Vypnuto'}
                        </span>
                    </div>
                )
            case 'textarea':
                return (
                    <Textarea
                        value={value as string}
                        onChange={(e) => 
                            setSettings(prev => ({ ...prev, [setting.key]: e.target.value }))
                        }
                        className="mt-1 bg-white/5 border-white/10 text-white"
                        rows={3}
                    />
                )
            case 'number':
                return (
                    <Input
                        type="number"
                        value={value as number}
                        onChange={(e) => 
                            setSettings(prev => ({ ...prev, [setting.key]: parseInt(e.target.value) }))
                        }
                        className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                )
            default:
                return (
                    <Input
                        type="text"
                        value={value as string}
                        onChange={(e) => 
                            setSettings(prev => ({ ...prev, [setting.key]: e.target.value }))
                        }
                        className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                )
        }
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
                            <Settings className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Nastavení systému
                            </h1>
                            <p className="text-gray-400 mt-1">
                                Spravujte konfiguraci serveru a webu
                            </p>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#8a0101] hover:bg-[#570000] text-white shadow-lg"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {isSaving ? 'Ukládání...' : 'Uložit vše'}
                    </Button>
                </div>
                
                {settings.maintenanceMode && (
                    <div className="flex items-center gap-2 p-3 lg:p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                        <AlertTriangle className="h-5 w-5 text-orange-400" />
                        <span className="text-orange-400 font-medium">
                            Server je v režimu údržby
                        </span>
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                
                <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                    {settingSections.map((section, index) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-white">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#b90505]/20 to-[#bd2727]/10 text-[#bd2727]">
                                            <section.icon className="h-5 w-5" />
                                        </div>
                                        {section.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {section.settings.map((setting) => (
                                        <div key={setting.key} className="space-y-2">
                                            <Label htmlFor={setting.key} className="text-white font-medium">
                                                {setting.label}
                                            </Label>
                                            {renderInput(setting)}
                                            <p className="text-xs text-gray-500">
                                                {setting.description}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                
                <div className="space-y-6 lg:space-y-8">
                    
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-white">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#b90505]/20 to-[#bd2727]/10 text-[#bd2727]">
                                        <Database className="h-5 w-5" />
                                    </div>
                                    Zálohy databáze
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <div className="flex items-center gap-2">
                                            <HardDrive className="h-4 w-4 text-blue-400" />
                                            <span className="text-sm text-blue-300">Celkem záloh</span>
                                        </div>
                                        <span className="text-blue-400 font-semibold">{backupStats.totalBackups}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-green-400" />
                                            <span className="text-sm text-green-300">Velikost</span>
                                        </div>
                                        <span className="text-green-400 font-semibold">{backupStats.totalSize}</span>
                                    </div>
                                </div>

                                
                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Typ zálohy</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            <Button
                                                onClick={() => createBackup('full')}
                                                disabled={isCreatingBackup}
                                                className="w-full justify-start bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Kompletní záloha
                                            </Button>
                                                                        <button
                                                onClick={() => createBackup('structure')}
                                                disabled={isCreatingBackup}
                                className="w-full justify-start border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 px-3 py-2 rounded-md bg-transparent flex items-center gap-2"
                                            >
                                <Database className="h-4 w-4" />
                                                Pouze struktura
                            </button>
                                                                        <button
                                                onClick={() => createBackup('data')}
                                                disabled={isCreatingBackup}
                                className="w-full justify-start border border-green-500/30 text-green-400 hover:bg-green-500/10 px-3 py-2 rounded-md bg-transparent flex items-center gap-2"
                                            >
                                <HardDrive className="h-4 w-4" />
                                                Pouze data
                            </button>
                                        </div>
                                    </div>

                                    {isCreatingBackup && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
                                            <span className="text-blue-300 text-sm">Vytváří se záloha...</span>
                                        </div>
                                    )}
                                </div>

                                
                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Automatické zálohy</Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={settings.autoBackup}
                                                onCheckedChange={(checked) => 
                                                    setSettings(prev => ({ ...prev, autoBackup: checked }))
                                                }
                                            />
                                            <span className="text-sm text-gray-400">
                                                {settings.autoBackup ? 'Zapnuto' : 'Vypnuto'}
                                            </span>
                                        </div>
                                    </div>

                                    {settings.autoBackup && (
                                        <div className="space-y-2">
                                            <Label className="text-white font-medium">Interval</Label>
                                            <Select
                                                value={settings.backupInterval}
                                                onValueChange={(value) => setSettings(prev => ({ ...prev, backupInterval: value }))}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hourly">Každou hodinu</SelectItem>
                                                    <SelectItem value="daily">Denně</SelectItem>
                                                    <SelectItem value="weekly">Týdně</SelectItem>
                                                    <SelectItem value="monthly">Měsíčně</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >
                        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-3 text-white">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#b90505]/20 to-[#bd2727]/10 text-[#bd2727]">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    Historie záloh
                                </CardTitle>
                                <Button
                                    onClick={fetchBackupInfo}
                                    className="border-white/20 text-white hover:bg-white/10 bg-transparent h-8 w-8 p-0"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-64">
                                    {isLoadingBackups ? (
                                        <div className="flex items-center justify-center h-32">
                                            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                                        </div>
                                    ) : backupHistory.length > 0 ? (
                                        <div className="space-y-3">
                                            {backupHistory.map((backup) => (
                                                <div key={backup.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="flex items-center gap-3">
                                                        {getStatusIcon(backup.status)}
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={`text-xs ${getBackupTypeColor(backup.type)}`}>
                                                                    {backup.type}
                                                                </Badge>
                                                                <span className="text-xs text-gray-400">
                                                                    {backup.file_size} MB
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(backup.created_at).toLocaleString('cs-CZ')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-32 text-gray-400">
                                            <div className="text-center">
                                                <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Žádné zálohy</p>
                                            </div>
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 lg:mt-12 p-3 lg:p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
            >
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-yellow-400 font-medium mb-1">Upozornění</h3>
                        <p className="text-yellow-300 text-sm">
                            Změny v nastavení mohou ovlivnit funkčnost serveru. 
                            Některé změny vyžadují restart serveru pro plnou aktivaci.
                            Zálohy jsou uloženy v <code className="bg-yellow-500/20 px-1 rounded">backups/</code> složce.
                        </p>
                    </div>
                </div>
            </motion.div>
        </>
    )
} 