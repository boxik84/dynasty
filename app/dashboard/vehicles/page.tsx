"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ChevronDown,
    MoreHorizontal,
    Car,
    RefreshCw,
    Copy,
    Trash2,
    User,
    Fuel,
    Activity,
    Gauge
} from "lucide-react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    ColumnFiltersState,
    VisibilityState,
    SortingState,
} from "@tanstack/react-table";

interface Vehicle {
    plate: string;
    owner: string;
    garage_id: string | null;
    type: string;
    job: string | null;
    stored: number;
    nickname: string | null;
    fuel: number;
    mileage: number;
    vehicle: any;
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [filter, setFilter] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [openDialogFor, setOpenDialogFor] = useState<Vehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchVehicles = async () => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const res = await fetch("/api/vehicles");
                const data = await res.json();

                if (res.ok) {
                    setVehicles(data);
                    toast.success(`Načteno ${data.length} vozidel`);
                    resolve();
                } else {
                    toast.error("Chyba při načítání vozidel");
                    reject(new Error(data.error));
                }
            } catch (error) {
                toast.error("Nastala chyba při načítání vozidel");
                console.error("Chyba při načítání vozidel:", error);
                reject(error);
            }
        });
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                toast.loading("Načítám vozidla...");
                await fetchVehicles();
                toast.dismiss();
            } catch (error) {
                toast.dismiss();
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const handleDelete = async (vehicle: Vehicle) => {
        try {
            const res = await fetch(`/api/vehicles/${vehicle.plate}`, { method: "DELETE" })

            if (res.ok) {
                toast.success("Vozidlo bylo úspěšně smazáno.");
                setVehicles((prev) => prev.filter((v) => v.plate !== vehicle.plate));

                const userRes = await fetch("/api/user/me");
                const userData = await userRes.json();

                await fetch("https://discordapp.com/api/webhooks/1359947852310122557/pVUIlnZXteWqGXl1ILJbhYnVrqdbwsJ1DxmgeRPUXfHm7wW5DRvn2ash-7BzV0QygStq", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        embeds: [
                            {
                                title: "🚨 Vozidlo smazáno",
                                color: 0xff0000,
                                fields: [
                                    {
                                        name: "👤 Uživatel",
                                        value: `${userData.username} (${userData.discordId})`,
                                        inline: false,
                                    },
                                    {
                                        name: "🚗 SPZ",
                                        value: vehicle.plate,
                                        inline: true,
                                    },
                                    {
                                        name: "🏷️ Přezdívka",
                                        value: vehicle.nickname || "Žádná",
                                        inline: true,
                                    },
                                    {
                                        name: "🕓 Čas",
                                        value: new Date().toLocaleString("cs-CZ"),
                                        inline: false,
                                    },
                                ],
                            },
                        ],
                    }),
                });
            } else {
                toast.error("Nepodařilo se smazat vozidlo.");
            }
        } catch (error) {
            toast.error("Došlo k chybě při mazání.");
            console.error(error);
        } finally {
            setOpenDialogFor(null);
        }
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

    const columns: ColumnDef<Vehicle>[] = [
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
        },
        {
            accessorKey: "plate",
            header: "SPZ",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-[#bd2727]" />
                    <span className="font-mono font-semibold text-[#bd2727]">
                        {row.getValue("plate")}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "owner",
            header: "Vlastník",
            cell: ({ row }) => {
                const owner: string = row.getValue("owner");
                const shortened = owner.length > 16 ? `${owner.slice(0, 6)}...${owner.slice(-3)}` : owner;

                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="font-mono text-xs cursor-help text-gray-300">{shortened}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span className="font-mono text-xs">{owner}</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: "garage_id",
            header: "Garáž",
            cell: ({ row }) => {
                const val = String(row.getValue("garage_id") || "");
                const display = val.length > 16 ? `${val.slice(0, 12)}...` : val;
                return (
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                        {display || "Žádná"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "type",
            header: "Typ",
            cell: ({ row }) => (
                <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">
                    {row.getValue("type")}
                </Badge>
            ),
        },
        {
            accessorKey: "job",
            header: "Job",
            cell: ({ row }) => {
                const job = row.getValue("job") as string;
                return job ? (
                    <Badge variant="outline" className="border-orange-500/30 text-orange-400 bg-orange-500/10">
                        {job}
                    </Badge>
                ) : (
                    <span className="text-gray-500">-</span>
                );
            },
        },
        {
            accessorKey: "stored",
            header: "Uloženo",
            cell: ({ row }) => {
                const stored = row.getValue("stored") === 1;
                return (
                    <Badge variant="outline" className={stored ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-red-500/30 text-red-400 bg-red-500/10"}>
                        {stored ? "Ano" : "Ne"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "nickname",
            header: "Přezdívka",
            cell: ({ row }) => {
                const val: string = row.getValue("nickname") || "";
                const display = val.length > 12 ? `${val.slice(0, 12)}...` : val;
                return display ? (
                    <span className="text-gray-300">{display}</span>
                ) : (
                    <span className="text-gray-500">-</span>
                );
            },
        },
        {
            accessorKey: "fuel",
            header: "Palivo",
            cell: ({ row }) => {
                const fuel = row.getValue("fuel") as number;
                const color = fuel > 50 ? "text-green-400" : fuel > 25 ? "text-yellow-400" : "text-red-400";
                return (
                    <div className="flex items-center gap-2">
                        <Fuel className={`h-4 w-4 ${color}`} />
                        <span className={color}>{fuel}%</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "mileage",
            header: "Nájezd",
            cell: ({ row }) => {
                const mileage: number = row.getValue("mileage");
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <Gauge className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs cursor-help text-gray-300">{mileage.toFixed(1)} km</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span className="text-xs">{mileage.toLocaleString("cs-CZ")} km</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right pr-4">Akce</div>,
            cell: ({ row }) => {
                const vehicle = row.original;

                return (
                    <div className="flex justify-end pr-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#131618] border-white/10">
                                <DropdownMenuLabel className="text-white">Akce</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => copyToClipboard(vehicle.plate, "SPZ")}
                                    className="text-gray-300 hover:text-white hover:bg-white/10"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Zkopírovat SPZ
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => copyToClipboard(vehicle.owner, "Vlastník")}
                                    className="text-gray-300 hover:text-white hover:bg-white/10"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Zkopírovat vlastníka
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                    onClick={() => setOpenDialogFor(vehicle)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Smazat
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialog open={openDialogFor?.plate === vehicle.plate} onOpenChange={(open) => !open && setOpenDialogFor(null)}>
                            <AlertDialogContent className="bg-[#131618] border-white/10">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Opravdu chceš smazat vozidlo?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                        SPZ: <span className="font-mono font-semibold text-[#bd2727]">{vehicle.plate}</span>
                                        <br />
                                        Tato akce je nevratná.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700 text-white">
                                        Zrušit
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDelete(vehicle)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        Smazat
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: vehicles,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    if (isLoading) {
        return (
            <div className="relative min-h-screen bg-[#0a0a0a]">
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
        <div className="relative min-h-screen bg-[#0a0a0a]">
            {/* Background effects */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-[#b90505]/8 blur-3xl" />
                <div className="absolute right-1/3 bottom-1/3 h-[300px] w-[500px] rounded-full bg-[#b90505]/5 blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0">

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
                                <Car className="h-4 w-4 text-[#bd2727] drop-shadow-[0_0_5px_#bd2727]" />
                                Správa vozidel
                            </Badge>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">
                                Databáze vozidel
                            </h1>
                            <p className="text-lg text-gray-400 max-w-2xl">
                                Správa všech vozidel na serveru s možností filtrování a mazání
                            </p>
                        </div>
                        <StatefulButton
                            onClick={fetchVehicles}
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
                                <Car className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
                            </div>
                            <CardTitle className="text-white text-sm">Celkem vozidel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-[#bd2727]">{vehicles.length}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center gap-3 pb-3">
                            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                                <Activity className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
                            </div>
                            <CardTitle className="text-white text-sm">Uložených vozidel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-400">
                                {vehicles.filter(v => v.stored === 1).length}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center gap-3 pb-3">
                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                <User className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
                            </div>
                            <CardTitle className="text-white text-sm">Jedinečných vlastníků</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-blue-400">
                                {new Set(vehicles.map(v => v.owner)).size}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center gap-3 pb-3">
                            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                <Fuel className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" />
                            </div>
                            <CardTitle className="text-white text-sm">Průměrné palivo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-purple-400">
                                {vehicles.length > 0 ? Math.round(vehicles.reduce((acc, v) => acc + v.fuel, 0) / vehicles.length) : 0}%
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                >
                    <Card className="bg-gradient-to-br from-[#131618]/80 via-[#151a1c]/80 to-[#111b22]/90 border border-white/10 shadow-xl rounded-2xl backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Car className="w-5 h-5 text-[#bd2727]" />
                                Seznam vozidel
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Kompletní přehled všech vozidel v databázi
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center py-4 gap-4">
                                <Input
                                    placeholder="Filtrovat podle SPZ..."
                                    value={filter}
                                    onChange={(e) => {
                                        setFilter(e.target.value);
                                        table.getColumn("plate")?.setFilterValue(e.target.value);
                                    }}
                                    className="max-w-sm bg-white/5 border-white/10 text-white"
                                />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="ml-auto border-white/10 text-white hover:bg-white/10">
                                            Sloupce <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#131618] border-white/10">
                                        {table.getAllColumns()
                                            .filter((column) => column.getCanHide())
                                            .map((column) => (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                    className="text-white hover:bg-white/10"
                                                >
                                                    {column.id}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="overflow-auto w-full">
                                <div className="min-w-[900px] sm:min-w-full rounded-md border border-white/10">
                                    <Table className="table-auto w-full text-sm">
                                        <TableHeader>
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <TableRow key={headerGroup.id} className="border-white/10 hover:bg-white/5">
                                                    {headerGroup.headers.map((header) => (
                                                        <TableHead key={header.id} className="whitespace-nowrap px-2 py-3 text-xs sm:text-sm text-gray-300">
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(header.column.columnDef.header, header.getContext())}
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
                                                            <TableCell key={cell.id} className="whitespace-nowrap px-2 py-2 text-xs sm:text-sm text-white">
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
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 py-4">
                                <div className="flex-1 text-sm text-gray-400">
                                    {table.getFilteredSelectedRowModel().rows.length} z {table.getFilteredRowModel().rows.length} vybráno.
                                </div>
                                <div className="space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        className="border-white/10 text-white hover:bg-white/10"
                                    >
                                        Předchozí
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        className="border-white/10 text-white hover:bg-white/10"
                                    >
                                        Další
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}