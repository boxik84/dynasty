import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import databasefivem from "@/lib/db-fivem";

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.session?.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const characterIdentifier = searchParams.get("character");

    if (!characterIdentifier) {
        return NextResponse.json({ error: "Character identifier required" }, { status: 400 });
    }

    try {
        // Získat transakce kde je postava buď odesílatelem nebo příjemcem
        const [rows] = await databasefivem.execute(
            `SELECT * FROM okokbanking_transactions 
             WHERE receiver_identifier = ? OR sender_identifier = ? 
             ORDER BY id DESC 
             LIMIT 100`,
            [characterIdentifier, characterIdentifier]
        );

        const transactions = Array.isArray(rows) ? rows : [];

        // Statistiky transakcí
        const stats = {
            totalIncome: 0,
            totalExpense: 0,
            totalTransactions: transactions.length,
            transactionsByType: {} as Record<string, number>,
            transactionsByMonth: {} as Record<string, number>,
        };

        transactions.forEach((transaction: any) => {
            const value = parseInt(transaction.value);
            const type = transaction.type?.toLowerCase();
            
            // Správná logika pro bankovní transakce
            // deposit = vklad (kladný), withdraw = výběr (záporný)
            const isDeposit = type === 'deposit' || type === 'vklad';
            const isWithdraw = type === 'withdraw' || type === 'vyber' || type === 'výběr';
            
            if (isDeposit) {
                stats.totalIncome += value;
            } else if (isWithdraw) {
                stats.totalExpense += value;
            } else {
                // Pro ostatní transakce použij původní logiku
                const isReceiver = transaction.receiver_identifier === characterIdentifier;
                if (isReceiver) {
                    stats.totalIncome += value;
                } else {
                    stats.totalExpense += value;
                }
            }

            // Počítání podle typu
            if (!stats.transactionsByType[transaction.type]) {
                stats.transactionsByType[transaction.type] = 0;
            }
            stats.transactionsByType[transaction.type]++;

            // Počítání podle dne místo měsíce
            try {
                const date = new Date(transaction.date);
                const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                if (!stats.transactionsByMonth[dayKey]) {
                    stats.transactionsByMonth[dayKey] = 0;
                }
                
                // Správné přiřazení hodnot
                if (isDeposit) {
                    stats.transactionsByMonth[dayKey] += value; // kladná hodnota pro vklad
                } else if (isWithdraw) {
                    stats.transactionsByMonth[dayKey] -= value; // záporná hodnota pro výběr
                } else {
                    // Pro ostatní transakce použij původní logiku
                    const isReceiver = transaction.receiver_identifier === characterIdentifier;
                    stats.transactionsByMonth[dayKey] += isReceiver ? value : -value;
                }
            } catch {
                // Ignorovat neplatné datumy
            }
        });

        return NextResponse.json({
            transactions,
            stats,
        });
    } catch (error) {
        console.error("Chyba při načítání banking transakcí:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
} 