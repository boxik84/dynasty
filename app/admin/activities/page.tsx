'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Activity,
    Plus,
    Edit3,
    Trash2,
    Save,
    X,

} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Image from 'next/image'

interface ActivityData {
    id?: number
    nazev: string
    popis: string
    obrazek?: string
    icon?: string
    odmena?: string
    vzdalenost?: string
    cas?: string
    riziko: string
    rizikoLevel: 'low' | 'medium' | 'high' | 'extreme'
    category: 'legal' | 'illegal' | 'heist'
    span?: number
    gradient?: string
    borderColor?: string
    glowColor?: string
}

const defaultActivity: ActivityData = {
    nazev: '',
    popis: '',
    obrazek: '',
    icon: '',
    odmena: '',
    vzdalenost: '',
    cas: '',
    riziko: '',
    rizikoLevel: 'low',
    category: 'legal',
    span: 1,
    gradient: '',
    borderColor: '',
    glowColor: ''
}

const riskLevels = [
    { value: 'low', label: 'Nízké', color: 'text-green-400' },
    { value: 'medium', label: 'Střední', color: 'text-yellow-400' },
    { value: 'high', label: 'Vysoké', color: 'text-orange-400' },
    { value: 'extreme', label: 'Extrémní', color: 'text-red-400' }
]

const categories = [
    { value: 'legal', label: 'Legální', color: 'text-green-400' },
    { value: 'illegal', label: 'Ilegální', color: 'text-orange-400' },
    { value: 'heist', label: 'Velká loupež', color: 'text-red-400' }
]

export default function ActivitiesAdmin() {
    const [activities, setActivities] = useState<ActivityData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editingActivity, setEditingActivity] = useState<ActivityData>(defaultActivity)
    const [isSaving, setIsSaving] = useState(false)

    // Load activities
    useEffect(() => {
        fetchActivities()
    }, [])

    const fetchActivities = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/admin/activities')
            
            if (!response.ok) {
                toast.error('Chyba při načítání aktivit')
                return
            }

            const data = await response.json()
            setActivities(data.activities || [])
        } catch (error) {
            console.error('Error fetching activities:', error)
            toast.error('Chyba při načítání aktivit')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (activity: ActivityData) => {
        setEditingActivity(activity)
        setIsEditing(true)
    }

    const handleNew = () => {
        setEditingActivity(defaultActivity)
        setIsEditing(true)
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)

            const response = await fetch('/api/admin/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editingActivity)
            })

            if (!response.ok) {
                const errorData = await response.json()
                toast.error(errorData.error || 'Chyba při ukládání')
                return
            }

            toast.success('Aktivita byla úspěšně uložena!')
            setIsEditing(false)
            fetchActivities()
        } catch (error) {
            console.error('Error saving activity:', error)
            toast.error('Chyba při ukládání aktivity')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Opravdu chcete smazat tuto aktivitu?')) return

        try {
            const response = await fetch(`/api/admin/activities/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                toast.error('Chyba při mazání')
                return
            }

            toast.success('Aktivita byla smazána!')
            fetchActivities()
        } catch (error) {
            console.error('Error deleting activity:', error)
            toast.error('Chyba při mazání aktivity')
        }
    }

    const getRiskBadge = (level: string) => {
        if (!level) return null
        const risk = riskLevels.find(r => r.value === level)
        if (!risk) return null
        
        const bgColor = level === 'low' ? 'bg-green-500/20 border-green-500/40' :
                        level === 'medium' ? 'bg-yellow-500/20 border-yellow-500/40' :
                        level === 'high' ? 'bg-orange-500/20 border-orange-500/40' :
                        'bg-red-500/20 border-red-500/40'
        
        return (
            <Badge className={`${risk.color} ${bgColor} text-xs font-medium px-2 py-1`}>
                {risk.label}
            </Badge>
        )
    }

    const getCategoryBadge = (category: string) => {
        if (!category) return null
        const cat = categories.find(c => c.value === category)
        if (!cat) return null
        
        const bgColor = category === 'legal' ? 'bg-green-500/20 border-green-500/40' :
                        category === 'illegal' ? 'bg-orange-500/20 border-orange-500/40' :
                        'bg-red-500/20 border-red-500/40'
        
        return (
            <Badge className={`${cat.color} ${bgColor} text-xs font-medium px-2 py-1`}>
                {cat.label}
            </Badge>
        )
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-4 bg-white/20 rounded mb-4"></div>
                            <div className="h-8 bg-white/10 rounded mb-2"></div>
                            <div className="h-20 bg-white/5 rounded"></div>
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
                            <Activity className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Správa aktivit
                            </h1>
                            <p className="text-gray-400 mt-1">
                                Spravujte herní aktivity na serveru
                            </p>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={handleNew}
                        className="bg-[#8a0101] hover:bg-[#570000] text-white shadow-lg"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Přidat aktivitu
                    </Button>
                </div>
                
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#bd2727]" />
                    <span className="text-sm text-gray-400">
                        Celkem aktivit: {activities.length}
                    </span>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-[#b90505]/40 hover:shadow-lg hover:shadow-[#b90505]/10 transition-all duration-300 group relative overflow-hidden">
                            {/* Subtle glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#b90505]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            
                            <CardHeader className="pb-3 relative">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg text-white mb-3 group-hover:text-[#bd2727] transition-colors duration-300 truncate">
                                            {activity.nazev}
                                        </CardTitle>
                                        <div className="flex gap-2 mb-2 flex-wrap">
                                            {getCategoryBadge(activity.category)}
                                            {getRiskBadge(activity.rizikoLevel)}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleEdit(activity)}
                                            className="h-8 w-8 p-0 hover:bg-blue-500/20 hover:text-blue-400 transition-all duration-200 rounded-lg"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => activity.id && handleDelete(activity.id)}
                                            className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 rounded-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative">
                                {activity.obrazek && (
                                    <div className="mb-4 rounded-lg overflow-hidden shadow-lg">
                                        <Image
                                            src={activity.obrazek}
                                            alt={activity.nazev}
                                            width={300}
                                            height={150}
                                            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                                    {activity.popis}
                                </p>
                                
                                <div className="space-y-2 text-xs border-t border-white/10 pt-3">
                                    {activity.odmena && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-gray-500 font-medium">💰 Odměna:</span>
                                            <span className="text-green-400 font-semibold">{activity.odmena}</span>
                                        </div>
                                    )}
                                    {activity.cas && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-gray-500 font-medium">⏱️ Čas:</span>
                                            <span className="text-blue-400 font-semibold">{activity.cas}</span>
                                        </div>
                                    )}
                                    {activity.riziko && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-gray-500 font-medium">⚠️ Riziko:</span>
                                            <span className="text-orange-400 font-semibold">{activity.riziko}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-gradient-to-br from-[#131618] via-[#151a1c] to-[#111b22] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">
                                    {editingActivity.id ? 'Upravit aktivitu' : 'Nová aktivita'}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditing(false)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="nazev" className="text-white">Název *</Label>
                                    <Input
                                        id="nazev"
                                        value={editingActivity.nazev}
                                        onChange={(e) => setEditingActivity({...editingActivity, nazev: e.target.value})}
                                        className="mt-1"
                                        placeholder="Název aktivity"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="popis" className="text-white">Popis *</Label>
                                    <Textarea
                                        id="popis"
                                        value={editingActivity.popis}
                                        onChange={(e) => setEditingActivity({...editingActivity, popis: e.target.value})}
                                        className="mt-1"
                                        placeholder="Popis aktivity"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category" className="text-white">Kategorie *</Label>
                                        <Select
                                            value={editingActivity.category}
                                            onValueChange={(value) => setEditingActivity({...editingActivity, category: value as any})}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="rizikoLevel" className="text-white">Úroveň rizika *</Label>
                                        <Select
                                            value={editingActivity.rizikoLevel}
                                            onValueChange={(value) => setEditingActivity({...editingActivity, rizikoLevel: value as any})}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {riskLevels.map(risk => (
                                                    <SelectItem key={risk.value} value={risk.value}>
                                                        {risk.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="riziko" className="text-white">Riziko text *</Label>
                                    <Input
                                        id="riziko"
                                        value={editingActivity.riziko}
                                        onChange={(e) => setEditingActivity({...editingActivity, riziko: e.target.value})}
                                        className="mt-1"
                                        placeholder="Popis rizika"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="odmena" className="text-white">Odměna</Label>
                                        <Input
                                            id="odmena"
                                            value={editingActivity.odmena}
                                            onChange={(e) => setEditingActivity({...editingActivity, odmena: e.target.value})}
                                            className="mt-1"
                                            placeholder="Odměna za aktivitu"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="cas" className="text-white">Čas</Label>
                                        <Input
                                            id="cas"
                                            value={editingActivity.cas}
                                            onChange={(e) => setEditingActivity({...editingActivity, cas: e.target.value})}
                                            className="mt-1"
                                            placeholder="Doba trvání"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="obrazek" className="text-white">URL obrázku</Label>
                                    <Input
                                        id="obrazek"
                                        value={editingActivity.obrazek}
                                        onChange={(e) => setEditingActivity({...editingActivity, obrazek: e.target.value})}
                                        className="mt-1"
                                        placeholder="/aktivity/obrazek.png"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !editingActivity.nazev || !editingActivity.popis}
                                    className="flex-1 bg-[#8a0101] hover:bg-[#570000] text-white"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    {isSaving ? 'Ukládání...' : 'Uložit'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    disabled={isSaving}
                                >
                                    Zrušit
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
} 