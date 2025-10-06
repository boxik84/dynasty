import { NextRequest, NextResponse } from "next/server";
import database from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasWhitelistPermissions } from "@/lib/utils";
import { headers } from "next/headers";
import axios from "axios";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

export async function PATCH(
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
        const body = await request.json();
        const { notes } = body;

        if (typeof notes !== 'string') {
            return NextResponse.json(
                { error: "Notes must be a string" },
                { status: 400 }
            );
        }

        // Zkontrolujeme, zda má uživatel práva na správu poznámek
        try {
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

        // Zkontrolujeme, zda žádost existuje
        const [checkRows] = await database.execute(
            "SELECT id FROM whitelist_requests WHERE id = ?",
            [id]
        );

        if (!Array.isArray(checkRows) || checkRows.length === 0) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        // Uložíme poznámky
        await database.execute(
            "UPDATE whitelist_requests SET notes = ?, updated_at = NOW() WHERE id = ?",
            [notes, id]
        );

        return NextResponse.json({ message: "Notes updated successfully" });

    } catch (error) {
        console.error("Error updating notes:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 