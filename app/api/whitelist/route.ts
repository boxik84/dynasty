import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasWhitelistPermissions } from "@/lib/utils";
import { headers } from "next/headers";
import axios from "axios";
import { webDb } from "@/lib/db";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const db = webDb as any;

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
        const account = await db
            .selectFrom("account")
            .select(["account_id"])
            .where("user_id", "=", session.user.id)
            .where("provider_id", "=", "discord")
            .executeTakeFirst();

        const discordId = account?.account_id as string | undefined;

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

        const rows = await db
            .selectFrom("whitelist_requests")
            .select(["id", "user_id", "form_data", "status", "serial_number", "created_at", "updated_at"])
            .orderBy("created_at", "desc")
            .execute();

        const requests = rows.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            formData: typeof row.form_data === "string" ? safeJsonParse(row.form_data) : row.form_data,
            status: row.status,
            serialNumber: row.serial_number,
            createdAt: toIso(row.created_at),
            updatedAt: toIso(row.updated_at),
        }));

        return NextResponse.json({ requests });
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
        const requestsArray = await db
            .selectFrom("whitelist_requests")
            .select(["id", "status"])
            .where("user_id", "=", session.user.id)
            .execute();
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
        const startOfYear = new Date(currentYear, 0, 1);
        
        // Get count of requests this year to generate sequential number
        const yearCountRow = await db
            .selectFrom("whitelist_requests")
            .select((qb: any) => qb.fn.count("id").as("count"))
            .where("created_at", ">=", startOfYear)
            .executeTakeFirst();
        const yearCount = Number(yearCountRow?.count ?? 0);
        
        const sequentialNumber = (yearCount + 1).toString().padStart(4, '0');
        const serialNumber = `WL-${currentYear}-${sequentialNumber}`;

        // Vytvoření nové žádosti
        await db
            .insertInto("whitelist_requests")
            .values({
                user_id: session.user.id,
                form_data: JSON.stringify(formData),
                status: 'pending',
                serial_number: serialNumber,
            })
            .execute();

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

function safeJsonParse(value: string) {
    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn("Failed to parse form_data JSON", error);
        return value;
    }
}

function toIso(value: any) {
    if (!value) return null;
    return value instanceof Date ? value.toISOString() : value;
}