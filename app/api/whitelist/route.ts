import { NextRequest, NextResponse } from "next/server";
import database from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasWhitelistPermissions } from "@/lib/utils";
import { headers } from "next/headers";
import axios from "axios";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

// GET - Získat všechny whitelist žádosti (pouze pro adminy)
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Získání Discord account ID
        const [accountRows] = await database.execute(
            "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
            [session.user.id]
        );

        const accountRow = Array.isArray(accountRows) ? (accountRows[0] as any) : null;
        const discordId = accountRow?.accountId;

        if (!discordId) {
            return NextResponse.json({ error: "No Discord account linked" }, { status: 404 });
        }

        // Získání rolí z Discord API
        try {
            const memberResponse = await axios.get(
                `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
                {
                    headers: {
                        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                    },
                }
            );

            const userRoles: string[] = memberResponse.data.roles || [];

            // Kontrola whitelist adder práv
            if (!hasWhitelistPermissions(userRoles)) {
                return NextResponse.json({ error: "Forbidden - insufficient permissions" }, { status: 403 });
            }
        } catch (error) {
            console.error("Error fetching Discord roles:", error);
            return NextResponse.json({ error: "Error verifying permissions" }, { status: 500 });
        }

        const [rows] = await database.execute(`
      SELECT id, user_id, form_data, status, serial_number, created_at, updated_at
      FROM whitelist_requests
      ORDER BY created_at DESC
    `);

        return NextResponse.json({ requests: rows });
    } catch (error) {
        console.error("Error fetching whitelist requests:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST - Vytvořit novou whitelist žádost
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { formData } = body;

        if (!formData) {
            return NextResponse.json(
                { error: "Form data is required" },
                { status: 400 }
            );
        }

        // Kontrola počtu pokusů (max 3)
        const [allRequests] = await database.execute(
            "SELECT id, status FROM whitelist_requests WHERE user_id = ?",
            [session.user.id]
        );

        const requestsArray = Array.isArray(allRequests) ? allRequests : [];
        const totalAttempts = requestsArray.length;
        const MAX_ATTEMPTS = 3;

        if (totalAttempts >= MAX_ATTEMPTS) {
            return NextResponse.json(
                { error: `Dosáhli jste maximálního počtu pokusů (${MAX_ATTEMPTS}). Nemůžete podat další žádost.` },
                { status: 400 }
            );
        }

        // Kontrola, zda už uživatel nemá aktivní žádost
        const activeRequest = requestsArray.find((req: any) => req.status === 'pending');
        if (activeRequest) {
            return NextResponse.json(
                { error: "Již máte aktivní žádost o whitelist" },
                { status: 400 }
            );
        }

        // Generate serial number
        const currentYear = new Date().getFullYear();
        
        // Get count of requests this year to generate sequential number
        const [yearCountRows] = await database.execute(
            `SELECT COUNT(*) as count FROM whitelist_requests WHERE YEAR(created_at) = ?`,
            [currentYear]
        );
        
        const yearCount = Array.isArray(yearCountRows) ? (yearCountRows[0] as any)?.count || 0 : 0;
        const sequentialNumber = (yearCount + 1).toString().padStart(4, '0');
        const serialNumber = `WL-${currentYear}-${sequentialNumber}`;

        // Vytvoření nové žádosti
        await database.execute(
            `INSERT INTO whitelist_requests (user_id, form_data, status, serial_number, created_at, updated_at)
       VALUES (?, ?, 'pending', ?, NOW(), NOW())`,
            [session.user.id, JSON.stringify(formData), serialNumber]
        );

        const remainingAttempts = MAX_ATTEMPTS - totalAttempts - 1;
        
        return NextResponse.json(
            { 
                message: "Whitelist žádost byla úspěšně odeslána",
                totalAttempts: totalAttempts + 1,
                remainingAttempts,
                maxAttempts: MAX_ATTEMPTS
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating whitelist request:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}