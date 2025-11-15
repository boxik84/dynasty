"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/stateful-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    User,
    Calendar,
    AlertCircle,
    RefreshCw,
    Copy,
    MoreHorizontal,
    TrendingUp,
    TrendingDown,
    FileText,
    BarChart3
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, LineChart, Line } from "recharts";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { motion } from 'framer-motion';

interface WhitelistRequest {
  id: number;
  user_id: string;
  form_data: string;
  status: 'pending' | 'approved' | 'rejected';
  serial_number: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  discordName: string;
  age: string;
  steamProfile: string;
  fivemHours: string;
  whyJoinServer: string;
  howFoundUs: string;
  whatIsRoleplay: string;
  icVsOoc: string;
  meCommand: string;
  doCommand: string;
  whatIsKos: string;
  whatIsMetagaming: string;
  whatIsMixing: string;
  whatIsPowergaming: string;
  fearRp: string;
  grossRp: string;
  waterEvading: string;
  copBaiting: string;
  passiveRp: string;
  nvl: string;
  vdm: string;
  rdm: string;
  advertising: string;
  failRp: string;
  lootboxing: string;
  robbery: string;
  inventory: string;
  pk: string;
  ck: string;
  rvdm: string;
  combatComeback: string;
  sprayingRules: string;
  personRecognition: string;
  kidnappingRules: string;
  scenario1: string;
  scenario2: string;
  rules: boolean;
}

export default function WhitelistDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<WhitelistRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<WhitelistRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const fetchRequests = async (showSuccessToast: boolean = false) => {
    return new Promise<void>(async (resolve, reject) => {
    try {
        const response = await fetch('/api/whitelist')
        const data = await response.json()

      if (response.ok) {
          setRequests(data.requests || [])
          if (showSuccessToast) {
            toast.success('Žádosti úspěšně obnoveny')
          }
          resolve()
      } else {
          toast.error('Chyba při načítání žádostí')
          reject(new Error(data.error))
      }
    } catch (error) {
        console.error('Error fetching requests:', error)
        toast.error('Chyba při načítání žádostí')
        reject(error)
    } finally {
        setIsLoading(false)
    }
    })
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchRequests(false); // Při prvním načtení nezobrazovat success toast
      } catch (error) {
        // Error už je zpracován ve fetchRequests
      }
    };
    
    loadInitialData();
  }, []);

  const handleStatusUpdate = async (requestId: number, status: 'approved' | 'rejected' | 'pending') => {
    setIsUpdating(requestId);

    try {
      const response = await fetch(`/api/whitelist/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (response.ok) {
        // Aktualizuj local state
        setRequests(prev =>
          prev.map(req =>
            req.id === requestId
              ? { ...req, status, updated_at: new Date().toISOString() }
              : req
          )
        );
        
        // Hlavní úspěšná notifikace
        toast.success(
          `Žádost byla ${status === 'approved' ? 'schválena' : 'odmítnuta'}`,
          {
            description: `Whitelist žádost #${requestId} byla úspěšně aktualizována.`,
          }
        );

        // Discord notifikace
        if (data.discordNotified && data.roleUpdated) {
          toast.success('Discord integrace úspěšná! 🎉', {
            description: `Notifikace odeslána a role ${status === 'approved' ? 'přidána' : 'odebrána'} uživateli ${data.discordId}`,
          });
        } else if (data.discordNotified && !data.roleUpdated) {
          toast.warning('Discord notifikace odeslána ⚠️', {
            description: `Zpráva odeslána, ale ${status === 'approved' ? 'přidání' : 'odebrání'} role se nezdařilo`,
          });
        } else if (!data.discordNotified && data.discordError) {
          toast.error('Discord integrace selhala ❌', {
            description: `Chyba: ${data.discordError}`,
          });
        }
      } else {
        console.error('Error updating request:', data.error);
        toast.error('Chyba při aktualizaci žádosti', {
          description: data.error || 'Došlo k neočekávané chybě',
        });
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Chyba při aktualizaci žádosti', {
        description: 'Došlo k neočekávané chybě',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
            <Clock className="h-3 w-3 mr-1" />
            Čeká se na vyhodnocení
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
            <CheckCircle className="h-3 w-3 mr-1" />
            Schváleno
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
            <XCircle className="h-3 w-3 mr-1" />
            Odmítnuto
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

      const parseFormData = (formDataString: string): FormData | null => {
        try {
            return JSON.parse(formDataString);
        } catch {
            return null;
        }
    };

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
    };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');

  const paginatedRequests = requests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);

  // Funkce pro přípravu dat pro grafy
  const prepareChartData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const chartData = last30Days.map(date => {
      const dayRequests = requests.filter(req => {
        const reqDate = new Date(req.created_at).toISOString().split('T')[0];
        return reqDate === date;
      });

      const approvedCount = dayRequests.filter(req => req.status === 'approved').length;
      const rejectedCount = dayRequests.filter(req => req.status === 'rejected').length;
      const totalCount = dayRequests.length;

      return {
        date: new Date(date).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' }),
        schvaleno: approvedCount,
        neschvaleno: rejectedCount,
        celkem: totalCount,
      };
    });

    return chartData;
  };

  const chartData = prepareChartData();
  
  const chartConfig = {
    schvaleno: {
      label: "Schváleno",
      color: "#10b981",
    },
    neschvaleno: {
      label: "Neschváleno", 
      color: "#f59e0b",
    },
    celkem: {
      label: "Celkem odesláno",
      color: "#3b82f6",
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 bg-white/5 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 bg-white/5 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a]">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-[#b90505]/8 blur-3xl" />
        <div className="absolute right-1/3 bottom-1/3 h-[300px] w-[500px] rounded-full bg-[#b90505]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-between py-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Správa Whitelistu</h1>
          <p className="text-gray-400">Spravujte žádosti o přístup na server</p>
        </div>
        <Button
          onClick={async () => {
            await fetchRequests(true);
          }}
          className="border-[#b90505]/30 text-[#bd2727] hover:bg-[#b90505]/10 bg-transparent"
        >
          Obnovit
        </Button>
      </motion.div>

      

      {/* Upravené kartičky s motion animací */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <Card className="bg-gradient-to-br from-yellow-950/30 via-yellow-900/30 to-yellow-950/30 border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-400 text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Čekající
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-300">{pendingRequests.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-950/30 via-green-900/30 to-green-950/30 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Schválené
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">{approvedRequests.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-950/30 via-red-900/30 to-red-950/30 border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-400 text-sm font-medium flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              Odmítnuté
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-300">{rejectedRequests.length}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Jeden velký kombinovaný graf */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#bd2727]" />
              Statistiky whitelist žádostí za posledních 30 dní
            </CardTitle>
            <CardDescription className="text-gray-400">
              Přehled schválených, neschválených a celkových odeslaných formulářů
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="fillSchvaleno" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="fillNeschvaleno" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="fillCelkem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickLine={{ stroke: '#374151' }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickLine={{ stroke: '#374151' }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <ChartTooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md backdrop-blur-sm" style={{
                            backgroundColor: 'rgba(19, 22, 24, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff'
                          }}>
                            <div className="font-semibold text-foreground dark:text-white mb-2">{label}</div>
                            {payload.map((entry, index) => (
                              <div key={index} className="flex items-center gap-2 mb-1">
                                <div 
                                  className="h-3 w-3 rounded-full" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-gray-300">
                                  {entry.name}: <span className="font-medium text-foreground dark:text-white">{entry.value}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ChartLegend 
                    content={({ payload }: { payload?: any[] }) => (
                      <div className="flex flex-wrap justify-center gap-6 pt-4">
                        {payload?.map((entry: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full shadow-sm" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-300 font-medium text-sm">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  
                  {/* Schválené žádosti - zelená */}
                  <Area
                    type="monotone"
                    dataKey="schvaleno"
                    stroke="#10b981"
                    fill="url(#fillSchvaleno)"
                    fillOpacity={0.2}
                    strokeWidth={3}
                    dot={false}
                    activeDot={false}
                    name="Schválené"
                  />
                  
                  {/* Neschválené žádosti - oranžová */}
                  <Area
                    type="monotone"
                    dataKey="neschvaleno"
                    stroke="#f59e0b"
                    fill="url(#fillNeschvaleno)"
                    fillOpacity={0.2}
                    strokeWidth={3}
                    dot={false}
                    activeDot={false}
                    name="Neschválené"
                  />
                  
                  {/* Celkové odeslaných formulářů - modrá */}
                  <Area
                    type="monotone"
                    dataKey="celkem"
                    stroke="#3b82f6"
                    fill="url(#fillCelkem)"
                    fillOpacity={0.2}
                    strokeWidth={3}
                    dot={false}
                    activeDot={false}
                    name="Celkem odeslaných"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
      >
      <Card className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-foreground dark:text-white">Whitelist žádosti</CardTitle>
          <CardDescription>
            Seznam všech žádostí o whitelist s možností schválení nebo odmítnutí
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Žádné whitelist žádosti</p>
            </div>
          ) : (
            <div className="overflow-auto w-full">
              <div className="min-w-[900px] sm:min-w-full rounded-md border">
                <Table className="table-auto w-full text-sm">
                  <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-gray-300 whitespace-nowrap px-2 py-3 text-xs sm:text-sm">Seriové číslo</TableHead>
                    <TableHead className="text-gray-300 whitespace-nowrap px-2 py-3 text-xs sm:text-sm">Discord</TableHead>
                    <TableHead className="text-gray-300 whitespace-nowrap px-2 py-3 text-xs sm:text-sm">Steam</TableHead>
                    <TableHead className="text-gray-300 whitespace-nowrap px-2 py-3 text-xs sm:text-sm">Věk</TableHead>
                    <TableHead className="text-gray-300 whitespace-nowrap px-2 py-3 text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-gray-300 whitespace-nowrap px-2 py-3 text-xs sm:text-sm">Datum</TableHead>
                    <TableHead className="text-gray-300 whitespace-nowrap px-2 py-3 text-xs sm:text-sm">
                      <div className="text-right pr-4">Akce</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.map((request) => {
                    const formData = parseFormData(request.form_data);
                    return (
                      <TableRow key={request.id} className="border-white/10 hover:bg-white/5 group">
                        <TableCell className="text-foreground dark:text-white whitespace-nowrap px-2 py-2 text-xs sm:text-sm">
                          <div className="flex items-center gap-1">
                            {request.serial_number ? (
                              <>
                                <span className="text-[#bd2727] font-mono font-semibold text-xs">
                                  {request.serial_number}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(request.serial_number, 'Seriové číslo')}
                                  className="p-1 rounded hover:bg-[#b90505]/20 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Kopírovat seriové číslo"
                                >
                                  <Copy className="h-3 w-3 text-[#bd2727]/60 hover:text-[#bd2727]" />
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground dark:text-white whitespace-nowrap px-2 py-2 text-xs sm:text-sm">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="truncate max-w-[100px]">{formData?.discordName || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground dark:text-white whitespace-nowrap px-2 py-2 text-xs sm:text-sm">
                          {formData?.steamProfile && formData.steamProfile !== 'N/A' ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span 
                                    className="text-blue-400 text-xs cursor-pointer hover:text-blue-300 transition-colors"
                                    onClick={() => copyToClipboard(formData.steamProfile, 'Steam profil')}
                                  >
                                    {formData.steamProfile.length > 20 
                                      ? `${formData.steamProfile.slice(0, 17)}...` 
                                      : formData.steamProfile
                                    }
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <span className="text-xs">{formData.steamProfile}</span>
                                    <div className="text-xs text-gray-400">Klikněte pro kopírování</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground dark:text-white whitespace-nowrap px-2 py-2 text-xs sm:text-sm">
                          {formData?.age ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help text-xs">
                                    {formData.age.length > 8 
                                      ? `${formData.age.slice(0, 6)}...` 
                                      : formData.age
                                    }
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span className="text-xs">{formData.age}</span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-2 py-2 text-xs sm:text-sm">{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-gray-300 whitespace-nowrap px-2 py-2 text-xs sm:text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="text-xs">{formatDate(request.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-2 py-2 text-xs sm:text-sm">
                          <div className="flex justify-end pr-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="h-8 w-8 p-0 hover:bg-white/10 rounded-md flex items-center justify-center">
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Akce</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/whitelist-detail/${request.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyToClipboard(request.serial_number || '', 'Seriové číslo')}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Kopírovat ID
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {request.status === 'pending' && (
                                  <>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                          onSelect={(e) => e.preventDefault()}
                                          disabled={isUpdating === request.id}
                                          className="text-green-600 focus:text-green-600"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Schválit žádost
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="bg-[#131618] border-white/10">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-foreground dark:text-white">
                                            Schválit žádost
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="text-gray-400">
                                            Opravdu chcete schválit tuto whitelist žádost?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700">
                                            Zrušit
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleStatusUpdate(request.id, 'approved')}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            Schválit
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                          onSelect={(e) => e.preventDefault()}
                                          disabled={isUpdating === request.id}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Odmítnout žádost
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="bg-[#131618] border-white/10">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-foreground dark:text-white">
                                            Odmítnout žádost
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="text-gray-400">
                                            Opravdu chcete odmítnout tuto whitelist žádost?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700">
                                            Zrušit
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Odmítnout
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                                {request.status === 'approved' && (
                                  <>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                          onSelect={(e) => e.preventDefault()}
                                          disabled={isUpdating === request.id}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Změnit na zamítnuto
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="bg-[#131618] border-white/10">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-foreground dark:text-white">
                                            Změnit status na Odmítnuto
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="text-gray-400">
                                            Tímto se odebere whitelist role a případně waiting role.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700">Zrušit</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Potvrdit
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                          onSelect={(e) => e.preventDefault()}
                                          disabled={isUpdating === request.id}
                                          className="text-yellow-600 focus:text-yellow-600"
                                        >
                                          <Clock className="h-4 w-4 mr-2" />
                                          Vrátit na vyhodnocení
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="bg-[#131618] border-white/10">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-foreground dark:text-white">
                                            Vrátit status na Čeká se na vyhodnocení
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="text-gray-400">
                                            Odebere whitelist roli a přidá waiting roli na Discordu.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700">Zrušit</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleStatusUpdate(request.id, 'pending')}
                                            className="bg-yellow-600 hover:bg-yellow-700"
                                          >
                                            Potvrdit
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                                {request.status === 'rejected' && (
                                  <>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                          onSelect={(e) => e.preventDefault()}
                                          disabled={isUpdating === request.id}
                                          className="text-green-600 focus:text-green-600"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Změnit na schváleno
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="bg-[#131618] border-white/10">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-foreground dark:text-white">
                                            Změnit status na Schváleno
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="text-gray-400">
                                            Přidá whitelist roli a odebere waiting roli na Discordu.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700">Zrušit</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleStatusUpdate(request.id, 'approved')}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            Potvrdit
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                          onSelect={(e) => e.preventDefault()}
                                          disabled={isUpdating === request.id}
                                          className="text-yellow-600 focus:text-yellow-600"
                                        >
                                          <Clock className="h-4 w-4 mr-2" />
                                          Vrátit na vyhodnocení
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="bg-[#131618] border-white/10">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-foreground dark:text-white">
                                            Vrátit status na Čeká se na vyhodnocení
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="text-gray-400">
                                            Přidá waiting roli na Discordu (pokud je člen).
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700">Zrušit</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleStatusUpdate(request.id, 'pending')}
                                            className="bg-yellow-600 hover:bg-yellow-700"
                                          >
                                            Potvrdit
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>

      
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
            <div className="text-sm text-gray-400">
                Stránka {currentPage} z {totalPages} ({requests.length} celkem)
            </div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(currentPage - 1);
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'text-gray-300 hover:bg-white/10 hover:text-foreground dark:text-white'}
                        >
                            Předchozí
                        </PaginationPrevious>
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                            return (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(page);
                                        }}
                                        isActive={currentPage === page}
                                        className={
                                            currentPage === page
                                                ? "bg-white/10 text-foreground dark:text-white border border-white/20"
                                                : "text-gray-400 hover:bg-white/5 hover:text-foreground dark:text-white"
                                        }
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <PaginationEllipsis key={page} className="text-gray-500" />;
                        }
                        return null;
                    })}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'text-gray-300 hover:bg-white/10 hover:text-foreground dark:text-white'}
                        >
                            Další
                        </PaginationNext>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
      )}

      
      {selectedRequest && (
        <AlertDialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <AlertDialogContent className="bg-[#131618] border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground dark:text-white flex items-center">
                <User className="h-5 w-5 mr-2" />
                Detail whitelist žádosti #{selectedRequest.id}
                {selectedRequest.serial_number && (
                  <span className="ml-2 text-[#bd2727] font-mono text-sm">
                    ({selectedRequest.serial_number})
                  </span>
                )}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Kompletní formulář ve formátu pro přehled odpovědí
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {(() => {
                const formData = parseFormData(selectedRequest.form_data);
                if (!formData) return <p className="text-red-400">Chyba při načítání dat</p>;

                const FormField = ({ label, value, isTextarea = false }: { label: string; value: string; isTextarea?: boolean }) => (
                  <div className="space-y-2">
                    <Label className="text-foreground dark:text-white font-medium">{label}</Label>
                    <div className="flex items-start gap-2">
                      {isTextarea ? (
                        <div className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-foreground dark:text-white text-sm whitespace-pre-wrap break-words word-break min-h-[60px] max-h-40 overflow-y-auto">
                          {value}
                        </div>
                      ) : (
                        <div className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-foreground dark:text-white text-sm break-words word-break">
                          {value}
                        </div>
                      )}
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs whitespace-nowrap flex-shrink-0 mt-1">
                        {value.length} znaků
                      </Badge>
                    </div>
                  </div>
                );

                return (
                  <div className="space-y-6">
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground dark:text-white border-b border-white/10 pb-2">Základní informace</h3>

                      <FormField label="Discord jméno (např. jakuubboss)" value={formData.discordName} />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Tvůj věk" value={formData.age} />
                        <FormField label="Kolik máš odehraných hodin na FiveM?" value={formData.fivemHours} />
                      </div>

                      <FormField label="Odkaz na Steam profil" value={formData.steamProfile} />

                      <FormField
                        label="Proč ses rozhodl/a přidat právě na náš server?"
                        value={formData.whyJoinServer}
                        isTextarea={true}
                      />

                      <FormField label="Odkud ses o nás dozvěděl?" value={formData.howFoundUs} />
                    </div>

                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground dark:text-white border-b border-white/10 pb-2">Otázky o pravidlech</h3>

                      <FormField
                        label="Co je to Roleplay?"
                        value={formData.whatIsRoleplay}
                        isTextarea={true}
                      />

                      <FormField
                        label="Jaký je rozdíl mezi IC a OOC?"
                        value={formData.icVsOoc}
                        isTextarea={true}
                      />

                      <FormField
                        label="K čemu slouží příkaz /me?"
                        value={formData.meCommand}
                        isTextarea={true}
                      />

                      <FormField
                        label="K čemu slouží příkaz /do a co se do /do nesmí psát?"
                        value={formData.doCommand}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co je to KOS?"
                        value={formData.whatIsKos}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co je to METAGAMING?"
                        value={formData.whatIsMetagaming}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co je to MIXING?"
                        value={formData.whatIsMixing}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co je to POWERGAMING?"
                        value={formData.whatIsPowergaming}
                        isTextarea={true}
                      />

                      <FormField
                        label="Vysvětli pravidlo FearRP a jaké typy FearRP známe"
                        value={formData.fearRp}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co je to GROSS RP a jaké typy Gross RP známe?"
                        value={formData.grossRp}
                        isTextarea={true}
                      />

                      <FormField
                        label="Vysvětli pojem WATER EVADING"
                        value={formData.waterEvading}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co je to COPBAITING?"
                        value={formData.copBaiting}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co je to Passive RP a kde všude platí Passive RP?"
                        value={formData.passiveRp}
                        isTextarea={true}
                      />
                    </div>

                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground dark:text-white border-b border-white/10 pb-2">Další pravidla</h3>

                      <FormField
                        label="Vysvětli pojem NVL"
                        value={formData.nvl}
                        isTextarea={true}
                      />

                      <FormField
                        label="Vysvětli pojem VDM"
                        value={formData.vdm}
                        isTextarea={true}
                      />

                      <FormField
                        label="Vysvětli pojem RDM"
                        value={formData.rdm}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co je to pravidlo Advertising?"
                        value={formData.advertising}
                        isTextarea={true}
                      />

                      <FormField
                        label="Vysvětli pojem FailRP a co může vést k FailRP (stačí 3 příklady)"
                        value={formData.failRp}
                        isTextarea={true}
                      />

                      <FormField
                        label="Vysvětli pojem Lootboxing"
                        value={formData.lootboxing}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co všechno víš o pravidle Vykrádaní?"
                        value={formData.robbery}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co všechno víš o pravidle Inventár?"
                        value={formData.inventory}
                        isTextarea={true}
                      />

                      <FormField
                        label="Vysvětli pojem PK"
                        value={formData.pk}
                        isTextarea={true}
                      />

                      <FormField
                        label="Vysvětli pojem CK"
                        value={formData.ck}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co je to RVDM?"
                        value={formData.rvdm}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co je to Combat Comeback?"
                        value={formData.combatComeback}
                        isTextarea={true}
                      />

                      <FormField
                        label="Co je zakázáno psát v Spraying?"
                        value={formData.sprayingRules}
                        isTextarea={true}
                      />

                      <FormField
                        label="Podle čeho nemůžeš poznat osobu (Poznávání osob)?"
                        value={formData.personRecognition}
                        isTextarea={true}
                      />

                      <FormField
                        label="Pravidlo únosu - jaká je maximální doba a kam je zakázáno unášet osobu/y?"
                        value={formData.kidnappingRules}
                        isTextarea={true}
                      />
                    </div>

                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground dark:text-white border-b border-white/10 pb-2">Scénáře - Co je špatně?</h3>

                      <div className="space-y-2">
                        <Label className="text-foreground dark:text-white font-medium">
                          Scénář 1: &quot;V kasínu jsi hrál kostky proti nějakému pánovi, popíjeli jste alkohol a ty jsi prohrál. Prohru jsi neunesl a dal jsi mu bagra, okolo bylo dost hráčů, tak jsi vytáhl carabinu, co jsi měl v inventáři a začal jsi všechny střílet. Před kasínem jsi ukradl první auto, co jsi viděl a vydal ses na jízdu směr hlavní garáže. Cestou tě zastavili policisti a po chvíli ti oznámili, že se shoduješ s popisem osoby, co v kasínu napadla pána. Řekl jsi, že nemáš náladu tohle RPit, odjel jsi na garáže a tam jsi dal F8 + quit.&quot;
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-foreground dark:text-white text-sm whitespace-pre-wrap min-h-[80px] max-h-40 overflow-y-auto">
                            {formData.scenario1}
                          </div>
                          <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs whitespace-nowrap">
                            {formData.scenario1.length} znaků
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground dark:text-white font-medium">
                          Scénář 2: &quot;Vykrádal jsi obchod, následně jsi se naháněl s PD a oni ti prostřelili 2 gumy. Ty jsi však pokračoval normálně v jízde, s autem jsi dojel do doků a skočil jsi s ním do vody. Následně jsi plaval jižním směrem, co nejdále do oceánu.&quot;
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-foreground dark:text-white text-sm whitespace-pre-wrap min-h-[80px] max-h-40 overflow-y-auto">
                            {formData.scenario2}
                          </div>
                          <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs whitespace-nowrap">
                            {formData.scenario2.length} znaků
                          </Badge>
                        </div>
                      </div>
                    </div>

                    
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <div>
                        <Label className="text-gray-300">Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                      </div>
                      <div className="text-right">
                        <Label className="text-gray-300">Datum vytvoření</Label>
                        <p className="text-foreground dark:text-white">{formatDate(selectedRequest.created_at)}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700">
                Zavřít
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      </div>
    </div>
  );
}

