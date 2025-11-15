import { NextResponse } from "next/server";
import database from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import axios from "axios";

const MAX_ATTEMPTS = 3;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_WHITELIST_ROLE_ID = process.env.DISCORD_WHITELIST_ROLE_ID!;

// GET - Získat whitelist žádosti aktuálního uživatele
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Získat Discord account ID
        const [accountRows] = await database.execute(
            "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
            [session.user.id]
        );

        const accountRow = Array.isArray(accountRows) ? (accountRows[0] as any) : null;
        const discordId = accountRow?.accountId;

        let hasWhitelist = false;
        if (discordId) {
            try {
                // Získat role z Discord API
                const memberResponse = await axios.get(
                    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
                    {
                        headers: {
                            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                        },
                    }
                );

                const roles: string[] = memberResponse.data.roles || [];
                hasWhitelist = roles.includes(DISCORD_WHITELIST_ROLE_ID);
            } catch (error) {
                console.error("Error fetching Discord roles:", error);
            }
        }

        // Získat všechny žádosti uživatele
        const [rows] = await database.execute(`
            SELECT id, form_data, status, serial_number, created_at, updated_at
            FROM whitelist_requests
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [session.user.id]);

        let requests = Array.isArray(rows) ? rows : [];

        // Pokud má uživatel whitelist ale nemá žádné žádosti, vytvořit automaticky schválenou
        if (hasWhitelist && requests.length === 0) {
            const automaticFormData = {
                discordName: discordId,
                age: "Automaticky schváleno",
                fivemHours: "Automaticky schváleno", 
                experience: "Automaticky schváleno - uživatel již má whitelist",
                reason: "Automaticky schváleno - uživatel již má whitelist roli na Discord serveru"
            };

            // Generate serial number for automatic approval
            const currentYear = new Date().getFullYear();
            
            const [yearCountRows] = await database.execute(
                `SELECT COUNT(*) as count FROM whitelist_requests WHERE YEAR(created_at) = ?`,
                [currentYear]
            );
            
            const yearCount = Array.isArray(yearCountRows) ? (yearCountRows[0] as any)?.count || 0 : 0;
            const sequentialNumber = (yearCount + 1).toString().padStart(4, '0');
            const serialNumber = `WL-${currentYear}-${sequentialNumber}`;

            await database.execute(
                `INSERT INTO whitelist_requests (user_id, form_data, status, serial_number, created_at, updated_at)
                 VALUES (?, ?, 'approved', ?, NOW(), NOW())`,
                [session.user.id, JSON.stringify(automaticFormData), serialNumber]
            );

            // Znovu načíst žádosti po vytvoření automatické
            const [newRows] = await database.execute(`
                SELECT id, form_data, status, serial_number, created_at, updated_at
                FROM whitelist_requests
                WHERE user_id = ?
                ORDER BY created_at DESC
            `, [session.user.id]);

            requests = Array.isArray(newRows) ? newRows : [];
        }

        const totalAttempts = requests.length;
        const remainingAttempts = Math.max(0, MAX_ATTEMPTS - totalAttempts);
        
        // Najít aktivní žádost (pending)
        const activeRequest = requests.find((req: any) => req.status === 'pending') || null;
        
        // Zjistit jestli může podat novou žádost
        const canSubmitNew = remainingAttempts > 0 && !activeRequest;

        return NextResponse.json({
            requests,
            totalAttempts,
            remainingAttempts,
            maxAttempts: MAX_ATTEMPTS,
            activeRequest,
            canSubmitNew,
            hasWhitelist
        });
    } catch (error) {
        console.error("Error fetching user whitelist requests:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 