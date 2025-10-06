"use server";

import { NextResponse } from "next/server";
import databasefivem from "@/lib/db-fivem";

export async function GET() {
    try {
        // Vyberu jen potřebné sloupce pro rychlejší načítání
        const [rows] = await databasefivem.execute(`
            SELECT plate, owner, garage_id, type, job, stored, nickname, fuel, mileage, vehicle
            FROM owned_vehicles
        `);
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
    }
}