"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Calendar,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  BarChart3,
  TrendingUp as LineChartIcon,
  RefreshCw
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, XAxis, YAxis, LineChart, Line, Area, AreaChart } from "recharts";
import { toast } from "sonner";

interface BankingTransaction {
  id: number;
  receiver_identifier: string;
  receiver_name: string;
  sender_identifier: string;
  sender_name: string;
  date: string;
  value: number;
  type: string;
}

interface BankingStats {
  totalIncome: number;
  totalExpense: number;
  totalTransactions: number;
  transactionsByType: Record<string, number>;
  transactionsByMonth: Record<string, number>;
}

interface BankingData {
  transactions: BankingTransaction[];
  stats: BankingStats;
}

export default function BankPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const characterId = searchParams.get("character");
  
  const [data, setData] = useState<BankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [characterName, setCharacterName] = useState<string>("");

    const fetchBankingData = async () => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const res = await fetch(`/api/banking-transactions?character=${characterId}`);
        const bankingData = await res.json();
        
        if (res.ok) {
          setData(bankingData);
          // Získat jméno postavy z první transakce
          if (bankingData.transactions.length > 0) {
            const firstTransaction = bankingData.transactions[0];
            const name = firstTransaction.receiver_identifier === characterId 
              ? firstTransaction.receiver_name 
              : firstTransaction.sender_name;
            setCharacterName(name);
            toast.success(`Načteno ${bankingData.transactions.length} transakcí`);
          } else {
            toast.info("Žádné transakce nenalezeny");
          }
          resolve();
        } else {
          toast.error("Chyba při načítání transakcí");
          console.error("Chyba při načítání banking dat:", bankingData.error);
          reject(new Error(bankingData.error));
        }
      } catch (error) {
        toast.error("Nastala chyba při načítání dat");
        console.error("Chyba při načítání banking dat:", error);
        reject(error);
      }
    });
  };

  useEffect(() => {
    if (!characterId) {
      router.push("/dashboard/characters");
      return;
    }

    const loadInitialData = async () => {
      try {
        setLoading(true);
        toast.loading("Načítám transakce...");
        await fetchBankingData();
        toast.dismiss();
      } catch (error) {
        toast.dismiss();
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [characterId, router]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a]">
        <div className="pointer-events-none absolute left-1/2 top-1/4 z-0 -translate-x-1/2">
          <div className="h-[400px] w-[600px] rounded-full bg-[#b90505]/8 blur-3xl" />
        </div>
        
        <div className="relative z-10 space-y-6 px-4 md:px-0">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 bg-white/5" />
            <Skeleton className="h-4 w-96 bg-white/5" />
          </div>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white/5 border border-white/10 rounded-2xl">
                <CardHeader>
                  <Skeleton className="h-6 w-1/2 bg-white/10" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-full bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a]">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-foreground dark:text-white">Chyba načítání</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Příprava dat pro grafy - Recharts formát
  const pieChartData = Object.entries(data.stats.transactionsByType).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const lineChartData = Object.entries(data.stats.transactionsByMonth)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime()) // Seřadit podle data vzestupně
    .slice(-30) // Posledních 30 dní pro lepší line chart
    .map(([day, value]) => ({
      day: new Date(day).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' }),
      cashflow: value,
    }));

  const pieColors = ['#bd2727', '#dc2626', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#f43f5e'];

  const chartConfig = {
    cashflow: {
      label: "Denní změna ($)",
      color: "#bd2727",
    },
  };

  return (
    <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a]">
      
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-[#b90505]/8 blur-3xl" />
        <div className="absolute right-1/3 bottom-1/3 h-[300px] w-[500px] rounded-full bg-[#b90505]/5 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8 px-4 md:px-0">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <Link href="/dashboard/characters">
              <Button variant="outline" className="border-[#b90505]/30 text-[#bd2727] hover:bg-[#b90505]/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět na postavy
              </Button>
            </Link>
            <StatefulButton
              onClick={fetchBankingData}
              className="border-[#b90505]/30 text-[#bd2727] hover:bg-[#b90505]/10 bg-transparent"
            >
              Obnovit
            </StatefulButton>
          </div>
          
          <div className="text-center">
            <Badge
              variant="outline"
              className="border-[#b90505]/60 text-[#bd2727] bg-[#b90505]/10 px-4 py-1 font-semibold tracking-wide backdrop-blur flex gap-2 w-fit mx-auto"
            >
              <DollarSign className="h-4 w-4 text-[#bd2727] drop-shadow-[0_0_5px_#bd2727]" />
              Banking transakce
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground dark:text-white text-center drop-shadow mt-4">
              {characterName || "Neznámá postava"}
            </h1>
            <p className="text-lg text-gray-400 text-center max-w-2xl mx-auto">
              Přehled všech bankovních transakcí a statistik vaší postavy
            </p>
          </div>
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                <TrendingUp className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
              </div>
              <CardTitle className="text-foreground dark:text-white text-sm">Celkové vklady</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">${data.stats.totalIncome.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                <TrendingDown className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
              </div>
              <CardTitle className="text-foreground dark:text-white text-sm">Celkové výběry</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-400">${data.stats.totalExpense.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <Activity className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
              </div>
              <CardTitle className="text-foreground dark:text-white text-sm">Čistý zisk</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${data.stats.totalIncome - data.stats.totalExpense >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(data.stats.totalIncome - data.stats.totalExpense).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Calendar className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
              </div>
              <CardTitle className="text-foreground dark:text-white text-sm">Celkem transakcí</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-400">{data.stats.totalTransactions}</p>
            </CardContent>
          </Card>
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
        >
          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#bd2727]" />
                Transakce podle typu
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
                <RechartsPieChart>
                  <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.3)"/>
                    </filter>
                  </defs>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        const value = typeof data.value === 'number' ? data.value : 0;
                        const total = pieChartData.reduce((sum, item) => sum + item.value, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md backdrop-blur-sm" style={{
                            backgroundColor: 'rgba(19, 22, 24, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff'
                          }}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-3 w-3 rounded-full" 
                                style={{ backgroundColor: data.payload?.fill || '#bd2727' }}
                              />
                              <span className="font-medium">{data.name || 'N/A'}</span>
                            </div>
                            <div className="mt-1 text-sm text-gray-300">
                              <div>Počet: {value}</div>
                              <div>Podíl: {percentage}%</div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="80%"
                    paddingAngle={3}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={2}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={pieColors[index % pieColors.length]}
                        filter="url(#shadow)"
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                        }}
                        onMouseEnter={(e) => {
                          const target = e.target as SVGElement;
                          target.style.filter = 'url(#glow) url(#shadow)';
                          target.style.transform = 'scale(1.05)';
                          target.style.transformOrigin = 'center';
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as SVGElement;
                          target.style.filter = 'url(#shadow)';
                          target.style.transform = 'scale(1)';
                        }}
                      />
                    ))}
                  </Pie>
                  <ChartLegend 
                    content={({ payload }) => (
                      <div className="flex flex-wrap justify-center gap-4 pt-4">
                        {payload?.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div 
                              className="h-3 w-3 rounded-full shadow-sm" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-300 font-medium">{entry.value}</span>
                            <span className="text-gray-500 text-xs">
                              ({pieChartData.find(item => item.name === entry.value)?.value || 0})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </RechartsPieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-[#bd2727]" />
                Denní změna financí za posledních 30 dní
              </CardTitle>
              <p className="text-sm text-gray-400 mt-2">
                Kolik peněz přibylo (+) nebo ubylo (-) za každý den
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={lineChartData}
                    margin={{
                      top: 5,
                      right: 15,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <defs>
                      <linearGradient id="fillCashflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#bd2727" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#bd2727" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickLine={{ stroke: '#374151' }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickLine={{ stroke: '#374151' }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      contentStyle={{
                        backgroundColor: 'rgba(19, 22, 24, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cashflow"
                      stroke="#bd2727"
                      fill="url(#fillCashflow)"
                      fillOpacity={0.3}
                      strokeWidth={3}
                      dot={false}
                      activeDot={false}
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
          transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
        >
          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#bd2727]" />
                Poslední transakce
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {data.transactions.slice(0, 20).map((transaction) => {
                  const type = transaction.type?.toLowerCase();
                  const isDeposit = type === 'deposit' || type === 'vklad';
                  const isWithdraw = type === 'withdraw' || type === 'vyber' || type === 'výběr';
                  
                  // Pro deposit/withdraw použij správnou logiku
                  let isPositive, otherParty;
                  if (isDeposit) {
                    isPositive = true; // deposit je vždy kladný
                    otherParty = "Bank Account";
                  } else if (isWithdraw) {
                    isPositive = false; // withdraw je vždy záporný
                    otherParty = "Bank Account";
                  } else {
                    // Pro ostatní transakce použij původní logiku
                    const isReceiver = transaction.receiver_identifier === characterId;
                    isPositive = isReceiver;
                    otherParty = isReceiver ? transaction.sender_name : transaction.receiver_name;
                  }
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-foreground dark:text-white font-medium">{otherParty}</p>
                          <p className="text-gray-400 text-sm">{transaction.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : '-'}${transaction.value.toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(transaction.date).toLocaleDateString('cs-CZ')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 