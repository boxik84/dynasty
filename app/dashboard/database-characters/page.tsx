"use client";

import { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  FilterFn,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Users,
  Copy,
  Edit3,
  RefreshCw,
  Activity,
  User,
  Crown,
  Calendar,
  BarChart3
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DatabaseCharacter {
  id: number;
  name: string;
  identifier: string;
  firstname: string;
  lastname: string;
  dateofbirth: string;
  sex: string;
  job: string;
  job_grade: number;
  phone_number: string;
  created_at: string;
  last_seen: string;
  steam_id: string;
  discord_id: string;
}

// Vlastní filterFn pro jméno (firstname + lastname)
const nameFilter: FilterFn<DatabaseCharacter> = (row, columnId, value) => {
  const { firstname, lastname } = row.original;
  return (
    (firstname + " " + lastname).toLowerCase().includes(String(value).toLowerCase())
  );
};

export default function DatabaseCharactersPage() {
  const [characters, setCharacters] = useState<DatabaseCharacter[]>([]);
  const [filter, setFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [error, setError] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [editCharacter, setEditCharacter] = useState<DatabaseCharacter | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const [filterColumn, setFilterColumn] = useState<"firstname" | "name" | "identifier" | "steam_id" | "discord_id">("firstname");

  const fetchCharacters = async () => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const res = await fetch("/api/database-characters", { cache: "no-store" });
        const data = await res.json();
        // console.log("[DB Characters] API data:", data);
        if (data.error) {
          toast.error("Chyba při načítání postav");
          setError(data.error);
          setCharacters([]);
          reject(new Error(data.error));
        } else if (Array.isArray(data)) {
          toast.success(`Načteno ${data.length} postav z databáze`);
          setCharacters(data);
          setError(null);
          resolve();
        } else {
          toast.error("Neznámá odpověď ze serveru");
          setCharacters([]);
          setError("Neznámá odpověď ze serveru.");
          reject(new Error("Neznámá odpověď ze serveru"));
        }
      } catch (err) {
        console.error("[DB Characters] Chyba při načítání:", err);
        toast.error("Nastala chyba při načítání databáze");
        setCharacters([]);
        setError("Chyba při načítání dat ze serveru.");
        reject(err);
      }
    });
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        toast.loading("Načítám databázi postav...");
        await fetchCharacters();
        toast.dismiss();
      } catch (error) {
        toast.dismiss();
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const openEditModal = (character: DatabaseCharacter) => {
    setEditCharacter(character);
    setEditFirstName(character.firstname);
    setEditLastName(character.lastname);
    setTimeout(() => firstNameInputRef.current?.focus(), 100);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} zkopírováno!`, {
        description: text,
        duration: 2000
      });
    } catch {
      toast.error('Nepodařilo se zkopírovat');
    }
  };

  const columns: ColumnDef<DatabaseCharacter>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-[#bd2727] font-semibold">
            #{row.getValue("id")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "firstname",
      header: "Jméno",
      cell: ({ row }) => {
        const fullName = `${row.original.firstname} ${row.original.lastname}`;
        const shortened = fullName.length > 10 ? `${fullName.slice(0, 10)}...` : fullName;
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            {fullName.length > 10 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-foreground dark:text-white font-medium cursor-help">{shortened}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-xs">{fullName}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-foreground dark:text-white font-medium">{fullName}</span>
            )}
          </div>
        );
      },
      filterFn: nameFilter,
    },
    {
      accessorKey: "name",
      header: "Steam jméno",
      filterFn: "includesString",
      cell: ({ row }) => {
        const name: string = row.getValue("name") || "";
        const shortened = name.length > 7 ? `${name.slice(0, 7)}...` : name;

        if (name.length > 7) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-gray-300 cursor-help">{shortened}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-xs">{name}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return <span className="text-gray-300">{name}</span>;
      },
    },
    {
      accessorKey: "identifier",
      header: "Identifikátor",
      filterFn: "includesString",
      cell: ({ row }) => {
        const value: string = row.getValue("identifier") || "";
        const shortened = value.length > 16 ? `${value.slice(0, 6)}...${value.slice(-3)}` : value;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono text-xs cursor-help text-gray-400">{shortened}</span>
              </TooltipTrigger>
              <TooltipContent>
                <span className="font-mono text-xs">{value}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "steam_id",
      header: "Steam ID",
      filterFn: "includesString",
      cell: ({ row }) => {
        const value: string = row.getValue("steam_id") || "";
        const shortened = value.length > 16 ? `${value.slice(0, 6)}...${value.slice(-3)}` : value;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono text-xs cursor-help text-gray-400">{shortened}</span>
              </TooltipTrigger>
              <TooltipContent>
                <span className="font-mono text-xs">{value}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "discord_id",
      header: "Discord ID",
      filterFn: "includesString",
      cell: ({ row }) => {
        const value: string = row.getValue("discord_id") || "";
        const shortened = value.length > 16 ? `${value.slice(0, 6)}...${value.slice(-3)}` : value;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono text-xs cursor-help text-gray-400">{shortened}</span>
              </TooltipTrigger>
              <TooltipContent>
                <span className="font-mono text-xs">{value}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Vytvořeno",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-300 text-sm">
            {new Date(row.original.created_at).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "last_seen",
      header: "Naposledy",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-gray-400" />
          <span className="text-gray-300 text-sm">
            {new Date(row.original.last_seen).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Akce</div>,
      cell: ({ row }) => {
        const character = row.original;
        return (
          <div className="flex justify-end pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#131618] border-white/10">
                <DropdownMenuLabel className="text-foreground dark:text-white">Akce</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => copyToClipboard(String(character.id), "ID")}
                  className="text-gray-300 hover:text-foreground dark:text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Zkopírovat ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => copyToClipboard(`${character.firstname} ${character.lastname}`, "Jméno")}
                  className="text-gray-300 hover:text-foreground dark:text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Zkopírovat jméno
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => copyToClipboard(character.name || "", "Steam jméno")}
                  className="text-gray-300 hover:text-foreground dark:text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Zkopírovat Steam jméno
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => copyToClipboard(character.identifier || "", "Identifikátor")}
                  className="text-gray-300 hover:text-foreground dark:text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Zkopírovat identifikátor
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => copyToClipboard(character.steam_id || "", "Steam ID")}
                  className="text-gray-300 hover:text-foreground dark:text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Zkopírovat Steam ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => copyToClipboard(character.discord_id || "", "Discord ID")}
                  className="text-gray-300 hover:text-foreground dark:text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Zkopírovat Discord ID
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => openEditModal(character)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Upravit jméno
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Funkce pro přípravu dat pro graf
  const prepareChartData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const chartData = last30Days.map(date => {
      const dayCharacters = characters.filter(character => {
        const createdDate = new Date(character.created_at).toISOString().split('T')[0];
        return createdDate === date;
      });

      return {
        date: new Date(date).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' }),
        postavy: dayCharacters.length,
      };
    });

    return chartData;
  };

  const chartData = prepareChartData();

  const chartConfig = {
    postavy: {
      label: "Vytvořené postavy",
      color: "#bd2727",
    },
  };

  const table = useReactTable({
    data: characters,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
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

  return (
    <div className="relative min-h-screen bg-background dark:bg-[#0a0a0a]">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-[#b90505]/8 blur-3xl" />
        <div className="absolute right-1/3 bottom-1/3 h-[300px] w-[500px] rounded-full bg-[#b90505]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-0">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between py-4">
            <div>
              <Badge
                variant="outline"
                className="border-[#b90505]/60 text-[#bd2727] bg-[#b90505]/10 px-4 py-1 font-semibold tracking-wide backdrop-blur flex gap-2 w-fit mb-4"
              >
                <Users className="h-4 w-4 text-[#bd2727] drop-shadow-[0_0_5px_#bd2727]" />
                Databáze postav
              </Badge>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground dark:text-white drop-shadow">
                Správa postav
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl">
                Přehled všech postav v databázi serveru s možností úprav a filtrování
              </p>
            </div>
            <StatefulButton
              onClick={fetchCharacters}
              className="border-[#b90505]/30 text-[#bd2727] hover:bg-[#b90505]/10 bg-transparent"
            >
              Obnovit
            </StatefulButton>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
        >
          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="p-2 rounded-lg bg-[#b90505]/20 text-[#bd2727]">
                <Users className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
              </div>
              <CardTitle className="text-foreground dark:text-white text-sm">Celkem postav</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#bd2727]">{characters.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <User className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
              </div>
              <CardTitle className="text-foreground dark:text-white text-sm">Jedinečných hráčů</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-400">
                {new Set(characters.map(c => c.steam_id)).size}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                <Crown className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
              </div>
              <CardTitle className="text-foreground dark:text-white text-sm">Různých jobů</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-400">
                {new Set(characters.map(c => c.job)).size}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                <Activity className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
              </div>
              <CardTitle className="text-foreground dark:text-white text-sm">Aktivní dnes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">
                {characters.filter(c => {
                  const lastSeen = new Date(c.last_seen);
                  const today = new Date();
                  return lastSeen.toDateString() === today.toDateString();
                }).length}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chart */}
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
                Statistiky vytvoření postav za posledních 30 dní
              </CardTitle>
              <CardDescription className="text-gray-400">
                Přehled počtu nově vytvořených postav za každý den
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="fillPostavy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#bd2727" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#bd2727" stopOpacity={0.1} />
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
                                    {(() => {
                                      const count = Number(entry.value);
                                      return count === 1 ? ' postava' : count >= 2 && count <= 4 ? ' postavy' : ' postav';
                                    })()}
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

                    {/* Vytvořené postavy - Retrovax červená */}
                    <Area
                      type="monotone"
                      dataKey="postavy"
                      stroke="#bd2727"
                      fill="url(#fillPostavy)"
                      fillOpacity={0.3}
                      strokeWidth={3}
                      dot={false}
                      activeDot={false}
                      name="Vytvořené postavy"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#bd2727]" />
                Seznam postav
              </CardTitle>
              <CardDescription className="text-gray-400">
                Kompletní databáze všech postav na serveru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center py-4 gap-4 flex-wrap">
                <Select value={filterColumn} onValueChange={v => setFilterColumn(v as any)}>
                  <SelectTrigger className="w-40 min-w-[120px] bg-white/5 border-white/10 text-foreground dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#131618] border-white/10">
                    <SelectItem value="firstname" className="text-foreground dark:text-white hover:bg-white/10">Jméno</SelectItem>
                    <SelectItem value="name" className="text-foreground dark:text-white hover:bg-white/10">Steam jméno</SelectItem>
                    <SelectItem value="identifier" className="text-foreground dark:text-white hover:bg-white/10">Identifikátor</SelectItem>
                    <SelectItem value="steam_id" className="text-foreground dark:text-white hover:bg-white/10">Steam ID</SelectItem>
                    <SelectItem value="discord_id" className="text-foreground dark:text-white hover:bg-white/10">Discord ID</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder={`Filtrovat podle ${filterColumn === "firstname" ? "jména" : filterColumn === "name" ? "Steam jména" : filterColumn === "steam_id" ? "Steam ID" : filterColumn === "discord_id" ? "Discord ID" : "identifikátoru"}...`}
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    table.getColumn(filterColumn)?.setFilterValue(e.target.value);
                  }}
                  onBlur={() => {
                    if (!filter) {
                      table.getColumn(filterColumn)?.setFilterValue("");
                    }
                  }}
                  className="max-w-sm bg-white/5 border-white/10 text-foreground dark:text-white"
                />
              </div>

              <div className="min-w-[350px] sm:min-w-full rounded-md border border-white/10 overflow-x-auto">
                {error ? (
                  <div className="p-6 text-center text-red-400">{error}</div>
                ) : (
                  <Table className="table-auto w-full text-sm">
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="border-white/10 hover:bg-white/5">
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="whitespace-nowrap px-2 py-3 text-xs sm:text-sm text-gray-300">
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} className="border-white/10 hover:bg-white/5">
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="whitespace-nowrap px-2 py-2 text-xs sm:text-sm">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="text-center text-gray-400 py-8">
                            Žádná data k zobrazení.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                  {table.getFilteredSelectedRowModel().rows.length} z {table.getFilteredRowModel().rows.length} vybráno.
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="border-white/10 text-foreground dark:text-white hover:bg-white/10"
                  >
                    Předchozí
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="border-white/10 text-foreground dark:text-white hover:bg-white/10"
                  >
                    Další
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Edit Modal */}
      <AlertDialog open={!!editCharacter} onOpenChange={(open) => !open && setEditCharacter(null)}>
        <AlertDialogContent className="bg-[#131618] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground dark:text-white">Upravit jméno postavy</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Změňte jméno a příjmení postavy. Změna je okamžitá.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">Jméno</label>
              <Input
                ref={firstNameInputRef}
                value={editFirstName}
                onChange={e => setEditFirstName(e.target.value)}
                disabled={saving}
                className="bg-white/5 border-white/10 text-foreground dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">Příjmení</label>
              <Input
                value={editLastName}
                onChange={e => setEditLastName(e.target.value)}
                disabled={saving}
                className="bg-white/5 border-white/10 text-foreground dark:text-white"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving} onClick={() => setEditCharacter(null)} className="bg-gray-600 hover:bg-gray-700 text-foreground dark:text-white">
              Zrušit
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={saving || !editFirstName.trim() || !editLastName.trim()}
              onClick={async () => {
                if (!editCharacter) return;
                setSaving(true);
                try {
                  const res = await fetch(`/api/database-characters/${editCharacter.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ firstname: editFirstName, lastname: editLastName }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    toast.error(data.error + (data.detail ? `\n${data.detail}` : ""));
                    return;
                  }
                  setCharacters(chars => chars.map(c => c.id === editCharacter.id ? { ...c, firstname: editFirstName, lastname: editLastName } : c));
                  setEditCharacter(null);
                  toast.success("Jméno bylo úspěšně změněno");
                } catch {
                  toast.error("Chyba při komunikaci se serverem");
                } finally {
                  setSaving(false);
                }
              }}
              className="bg-[#b90505] hover:bg-[#bd2727] text-foreground dark:text-white"
            >
              {saving ? "Ukládání..." : "Uložit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}