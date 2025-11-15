import { NextRequest, NextResponse } from "next/server";
import database from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasWhitelistPermissions } from "@/lib/utils";
import { headers } from "next/headers";
import axios from "axios";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Nejdříve získáme žádost
        const [rows] = await database.execute(
            "SELECT id, user_id, form_data, status, serial_number, notes, created_at, updated_at FROM whitelist_requests WHERE id = ?",
            [id]
        );

        const request = Array.isArray(rows) ? (rows[0] as any) : null;

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        // Zkontrolujeme, zda může uživatel spravovat poznámky (má whitelist admin práva)
        let canManageNotes = false;

        try {
            // Získání Discord account ID
            const [accountRows] = await database.execute(
                "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
                [session.user.id]
            );

            const accountRow = Array.isArray(accountRows) ? (accountRows[0] as any) : null;
            const discordId = accountRow?.accountId;

            if (discordId) {
                // Získání rolí z Discord API
                const memberResponse = await axios.get(
                    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
                    {
                        headers: {
                            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                        },
                    }
                );

                const userRoles: string[] = memberResponse.data.roles || [];
                canManageNotes = hasWhitelistPermissions(userRoles);
            }
        } catch (error) {
            console.error("Error checking permissions:", error);
            // I pokud selže kontrola rolí, pokračujeme dál - uživatel jen nebude moci spravovat poznámky
        }

        // Zkontrolujeme, zda je uživatel vlastník žádosti nebo má admin práva
        const isOwner = request.user_id === session.user.id;
        const canViewRequest = isOwner || canManageNotes;

        if (!canViewRequest) {
            return NextResponse.json({ error: "Forbidden - insufficient permissions" }, { status: 403 });
        }

        return NextResponse.json({
            request,
            canManageNotes
        });

    } catch (error) {
        console.error("Error fetching whitelist request:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 