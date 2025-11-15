import { NextResponse } from "next/server";
import database from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET - Získat status whitelist žádosti aktuálního uživatele
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Najít nejnovější žádost uživatele
        const [rows] = await database.execute(`
      SELECT id, status, created_at, updated_at
      FROM whitelist_requests
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [session.user.id]);

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({
                hasRequest: false,
                status: null,
                message: "Žádná whitelist žádost nenalezena"
            });
        }

        const request = rows[0] as any;

        return NextResponse.json({
            hasRequest: true,
            status: request.status,
            requestId: request.id,
            createdAt: request.created_at,
            updatedAt: request.updated_at,
            message: getStatusMessage(request.status)
        });
    } catch (error) {
        console.error("Error fetching whitelist status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

function getStatusMessage(status: string): string {
    switch (status) {
        case 'pending':
            return 'Žádost čeká se na vyhodnocení';
        case 'approved':
            return 'Schválená žádost';
        case 'rejected':
            return 'Zamítnutá žádost';
        default:
            return 'Neznámý status žádosti';
    }
}