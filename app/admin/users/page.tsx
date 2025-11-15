'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/stateful-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Users,
    Search,
    Shield,
    User,
    Crown,
    Code,
    MoreHorizontal,
    Trash2,
    AlertTriangle,
    UserCheck,
    UserX,
    Calendar,
    Activity,
    Filter,
    RefreshCw,
    Eye,
    Ban
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface UserData {
    id: string
    name: string
    email: string
    image?: string
    discordId: string
    emailVerified: boolean
    createdAt: string
    updatedAt: string
    activeSessions: number
    sessionIds: string[]
    roles: string[]
    permissions: {
        hasVedeniRole: boolean
        hasStaffRole: boolean
        hasDeveloperRole: boolean
        isAdmin: boolean
        isBlacklisted: boolean
    }
}

interface UserStats {
    totalUsers: number
    activeUsers: number
    adminUsers: number
    blacklistedUsers: number
}

export default function UsersAdmin() {
    const [users, setUsers] = useState<UserData[]>([])
    const [stats, setStats] = useState<UserStats>({
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        blacklistedUsers: 0
    })
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async (isManualRefresh = false) => {
        // Při manuálním obnovení se nezobrazuje hlavní loader, jen tlačítko
        if (!isManualRefresh) {
            setIsLoading(true)
        }
        try {
            const response = await fetch('/api/admin/users')
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || 'Failed to fetch users')
            }

            const data = await response.json()
            setUsers(data.users || [])
            setStats({
                totalUsers: data.totalUsers || 0,
                activeUsers: data.activeUsers || 0,
                adminUsers: data.adminUsers || 0,
                blacklistedUsers: data.blacklistedUsers || 0
            })
            if (isManualRefresh) {
                toast.success('Uživatelé úspěšně obnoveni')
            }
        } catch (error: any) {
            console.error('Error fetching users:', error)
            toast.error(error.message || 'Chyba při načítání uživatelů')
        } finally {
            if (!isManualRefresh) {
                setIsLoading(false)
            }
        }
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        setIsDeleting(true)
        try {
            const response = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userToDelete.id })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete user')
            }

            toast.success('Uživatel byl úspěšně smazán')
            setIsDeleteDialogOpen(false)
            setUserToDelete(null)
            await fetchUsers()
        } catch (error: any) {
            console.error('Error deleting user:', error)
            toast.error(error.message || 'Chyba při mazání uživatele')
        } finally {
            setIsDeleting(false)
        }
    }

    const openDeleteDialog = (user: UserData) => {
        setUserToDelete(user)
        setIsDeleteDialogOpen(true)
    }

    const openUserDetails = (user: UserData) => {
        setSelectedUser(user)
        setIsUserDetailsOpen(true)
    }

    const getRoleBadge = (user: UserData) => {
        if (user.permissions.isBlacklisted) {
            return <Badge variant="destructive" className="text-xs"><Ban className="h-3 w-3 mr-1" />Blacklisted</Badge>
        }
        if (user.permissions.hasVedeniRole) {
            return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs"><Crown className="h-3 w-3 mr-1" />Vedení</Badge>
        }
        if (user.permissions.hasDeveloperRole) {
            return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs"><Code className="h-3 w-3 mr-1" />Developer</Badge>
        }
        if (user.permissions.hasStaffRole) {
            return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"><Shield className="h-3 w-3 mr-1" />Staff</Badge>
        }
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs"><User className="h-3 w-3 mr-1" />Uživatel</Badge>
    }

    const getStatusBadge = (user: UserData) => {
        if (user.activeSessions > 0) {
            return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"><Activity className="h-3 w-3 mr-1" />Online</Badge>
        }
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">Offline</Badge>
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.discordId?.includes(searchTerm)

        const matchesRole = roleFilter === 'all' || 
                           (roleFilter === 'admin' && user.permissions.isAdmin) ||
                           (roleFilter === 'staff' && user.permissions.hasStaffRole) ||
                           (roleFilter === 'user' && !user.permissions.isAdmin && !user.permissions.hasStaffRole) ||
                           (roleFilter === 'blacklisted' && user.permissions.isBlacklisted)

        const matchesStatus = statusFilter === 'all' ||
                             (statusFilter === 'online' && user.activeSessions > 0) ||
                             (statusFilter === 'offline' && user.activeSessions === 0)

        return matchesSearch && matchesRole && matchesStatus
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="w-12 h-12 border-4 border-[#b90505] border-t-transparent rounded-full animate-spin"></div>
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
                            <Users className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Správa uživatelů
                            </h1>
                            <p className="text-gray-400 mt-1">
                                Spravujte uživatelské účty a oprávnění
                            </p>
                        </div>
                    </div>
                    
                    <Button
                        onClick={() => fetchUsers(true)}
                        className="border-[#b90505]/40 text-[#bd2727] hover:bg-[#b90505]/10 bg-transparent"
                    >
                        Obnovit
                    </Button>
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <Users className="h-4 w-4 text-[#bd2727]" />
                    <span className="text-sm text-gray-400">
                        {stats.totalUsers} celkem • {stats.activeUsers} aktivních • {stats.adminUsers} administrátorů
                    </span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
                    <Card className="bg-gradient-to-br from-blue-950/30 via-blue-900/30 to-blue-950/30 border-blue-500/20">
                        <CardContent className="p-3 lg:p-4">
                            <div className="text-xl lg:text-2xl font-bold text-blue-300">{stats.totalUsers}</div>
                            <p className="text-blue-200 text-xs lg:text-sm">Celkem uživatelů</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-950/30 via-green-900/30 to-green-950/30 border-green-500/20">
                        <CardContent className="p-3 lg:p-4">
                            <div className="text-xl lg:text-2xl font-bold text-green-300">{stats.activeUsers}</div>
                            <p className="text-green-200 text-xs lg:text-sm">Aktivní uživatelé</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-950/30 via-purple-900/30 to-purple-950/30 border-purple-500/20">
                        <CardContent className="p-3 lg:p-4">
                            <div className="text-xl lg:text-2xl font-bold text-purple-300">{stats.adminUsers}</div>
                            <p className="text-purple-200 text-xs lg:text-sm">Administrátoři</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-950/30 via-red-900/30 to-red-950/30 border-red-500/20">
                        <CardContent className="p-3 lg:p-4">
                            <div className="text-xl lg:text-2xl font-bold text-red-300">{stats.blacklistedUsers}</div>
                            <p className="text-red-200 text-xs lg:text-sm">Blacklisted</p>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Hledat uživatele..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10 text-white text-sm lg:text-base"
                        />
                    </div>
                    
                    <div className="flex gap-2 lg:gap-3">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-32 lg:w-40 bg-white/5 border-white/10 text-white text-sm lg:text-base">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Všechny role</SelectItem>
                                <SelectItem value="admin">Administrátoři</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="user">Uživatelé</SelectItem>
                                <SelectItem value="blacklisted">Blacklisted</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-24 lg:w-32 bg-white/5 border-white/10 text-white text-sm lg:text-base">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Všichni</SelectItem>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="offline">Offline</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6"
            >
                <AnimatePresence>
                    {filteredUsers.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            layout
                        >
                            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-[#b90505]/30 transition-all duration-300 group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 lg:h-12 lg:w-12">
                                                <AvatarImage src={user.image} alt={user.name} />
                                                <AvatarFallback className="bg-gradient-to-br from-[#bd2727] to-[#b90505] text-white font-bold">
                                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-white text-sm lg:text-base truncate">{user.name}</h3>
                                                <p className="text-xs text-gray-400 break-all">
                                                    {user.discordId ? `Discord: ${user.discordId}` : user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                                                <button
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 rounded-md flex items-center justify-center"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>Akce</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => openUserDetails(user)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Zobrazit detail
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => openDeleteDialog(user)}
                                                    className="text-red-400 focus:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Smazat uživatele
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Role:</span>
                                        {getRoleBadge(user)}
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Status:</span>
                                        {getStatusBadge(user)}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Sessions:</span>
                                        <span className="text-xs text-gray-300">{user.activeSessions}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Registrován:</span>
                                        <span className="text-xs text-gray-300">
                                            {new Date(user.createdAt).toLocaleDateString('cs-CZ')}
                                        </span>
                                    </div>

                                    {user.permissions.isBlacklisted && (
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <AlertTriangle className="h-4 w-4 text-red-400" />
                                            <span className="text-xs text-red-400">Blacklisted uživatel</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredUsers.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">Žádní uživatelé nenalezeni</h3>
                    <p className="text-gray-500">Zkuste upravit vyhledávací kritéria nebo filtry</p>
                </motion.div>
            )}

            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-gradient-to-br from-[#131618]/95 via-[#151a1c]/95 to-[#111b22]/95 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            Smazat uživatele
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Opravdu chcete smazat uživatele{' '}
                            <span className="font-semibold text-white">{userToDelete?.name}</span>?
                            <br />
                            <br />
                            Tato akce:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Smaže uživatelský účet</li>
                                <li>Ukončí všechny aktivní session</li>
                                <li>Smaže whitelist žádosti</li>
                                <li>Nelze vrátit zpět</li>
                            </ul>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                            className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-md bg-transparent"
                        >
                            Zrušit
                        </button>
                        <Button
                            onClick={handleDeleteUser}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            {isDeleting ? 'Mazání...' : 'Smazat'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            
            <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
                <DialogContent className="max-w-2xl bg-gradient-to-br from-[#131618]/95 via-[#151a1c]/95 to-[#111b22]/95 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={selectedUser?.image} alt={selectedUser?.name} />
                                <AvatarFallback className="bg-gradient-to-br from-[#bd2727] to-[#b90505] text-white font-bold text-sm">
                                    {selectedUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            Detail uživatele
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Kompletní informace o uživateli {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedUser && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Jméno</label>
                                        <p className="text-white">{selectedUser.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Email</label>
                                        <p className="text-white break-all">{selectedUser.email || 'Není nastaveno'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Discord ID</label>
                                        <p className="text-white">{selectedUser.discordId || 'Není propojeno'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Email ověřen</label>
                                        <div className="flex items-center gap-2">
                                            {selectedUser.emailVerified ? (
                                                <UserCheck className="h-4 w-4 text-green-400" />
                                            ) : (
                                                <UserX className="h-4 w-4 text-red-400" />
                                            )}
                                            <span className="text-white">
                                                {selectedUser.emailVerified ? 'Ano' : 'Ne'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Role</label>
                                        <div className="mt-1">
                                            {getRoleBadge(selectedUser)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Aktivní sessions</label>
                                        <p className="text-white">{selectedUser.activeSessions}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Registrace</label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-white">
                                                {new Date(selectedUser.createdAt).toLocaleString('cs-CZ')}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Poslední aktivita</label>
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-gray-400" />
                                            <span className="text-white">
                                                {new Date(selectedUser.updatedAt).toLocaleString('cs-CZ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-400">Oprávnění</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedUser.permissions.isAdmin && (
                                        <Badge variant="outline" className="border-red-500/30 text-red-400">
                                            <Crown className="h-3 w-3 mr-1" />Admin
                                        </Badge>
                                    )}
                                    {selectedUser.permissions.hasVedeniRole && (
                                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                                            <Crown className="h-3 w-3 mr-1" />Vedení
                                        </Badge>
                                    )}
                                    {selectedUser.permissions.hasDeveloperRole && (
                                        <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                                            <Code className="h-3 w-3 mr-1" />Developer
                                        </Badge>
                                    )}
                                    {selectedUser.permissions.hasStaffRole && (
                                        <Badge variant="outline" className="border-green-500/30 text-green-400">
                                            <Shield className="h-3 w-3 mr-1" />Staff
                                        </Badge>
                                    )}
                                    {selectedUser.permissions.isBlacklisted && (
                                        <Badge variant="outline" className="border-red-500/30 text-red-400">
                                            <Ban className="h-3 w-3 mr-1" />Blacklisted
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
} 