import { NextRequest, NextResponse } from "next/server";
import database from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasWhitelistPermissions } from "@/lib/utils";
import { headers } from "next/headers";
import axios from "axios";
import { 
    addWhitelistRole,
    removeWaitingRole,
    addWaitingRole,
    removeWhitelistRole,
} from "@/lib/discord-log";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

// PATCH - Schválit/odmítnout whitelist žádost (pouze pro adminy)
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

        // Získání Discord account ID a kontrola oprávnění
        const [accountRows] = await database.execute(
            "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
            [session.user.id]
        );

        const accountRow = Array.isArray(accountRows) ? (accountRows[0] as any) : null;
        const discordId = accountRow?.accountId;

        if (!discordId) {
            return NextResponse.json({ error: "No Discord account linked" }, { status: 404 });
        }

        // Získání rolí z Discord API a kontrola oprávnění
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

        const body = await request.json();
        const { status } = body as { status?: 'pending' | 'approved' | 'rejected' };

        if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status. Must be 'pending', 'approved' or 'rejected'" },
                { status: 400 }
            );
        }

        const { id: requestId } = await params;

        // Kontrola existence žádosti a získání detailů
        const [existingRequest] = await database.execute(
            "SELECT id, user_id, form_data, serial_number FROM whitelist_requests WHERE id = ?",
            [requestId]
        );

        if (!Array.isArray(existingRequest) || existingRequest.length === 0) {
            return NextResponse.json(
                { error: "Whitelist žádost nenalezena" },
                { status: 404 }
            );
        }

        const whitelistRequest = existingRequest[0] as any;

        // Získání Discord ID žadatele z databáze (ne z formuláře!)
        let applicantDiscordId: string | null = null;
        let formData: any = null;
        
        try {
            // Parsujeme form_data pro dodatečné informace
            formData = JSON.parse(whitelistRequest.form_data);
            
            // Discord ID VŽDY získáváme z databáze účtů, ne z formuláře
            const [userAccountRows] = await database.execute(
                "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
                [whitelistRequest.user_id]
            );
            const userAccount = Array.isArray(userAccountRows) ? userAccountRows[0] as any : null;
            applicantDiscordId = userAccount?.accountId;
            
            if (!applicantDiscordId) {
                console.error(`Nepodařilo se najít Discord ID pro user_id: ${whitelistRequest.user_id}`);
            }
        } catch (error) {
            console.error("Chyba při získávání Discord ID žadatele:", error);
        }

        // Získání jména adminstrátora kdo schvaluje
        const approverName = session.user.name || "Neznámý admin";
        
        // Aktualizace statusu
        await database.execute(
            "UPDATE whitelist_requests SET status = ?, updated_at = NOW() WHERE id = ?",
            [status, requestId]
        );

        // Discord integrace (notifikace vypnuta)
        const discordSuccess = false;
        let roleSuccess = false;
        let discordError: string | null = null;

        console.log(`🚀 Zahajuji Discord integraci pro žádost ${requestId}`);
        console.log(`Discord ID žadatele: ${applicantDiscordId}`);
        console.log(`Status: ${status}`);

        if (applicantDiscordId) {
            try {
                // Notifikace na Discord jsou deaktivovány

                // Správa rolí podle statusu
                if (status === 'approved') {
                    console.log(`🎯 Přidávám whitelist roli...`);
                    // Pro schválení: přidáme whitelist roli (automaticky odebere waiting roli)
                    roleSuccess = await addWhitelistRole(applicantDiscordId);
                    if (!roleSuccess) {
                        console.warn(`⚠️ Nepodařilo se přidat whitelist roli uživateli ${applicantDiscordId}`);
                    } else {
                        console.log(`✅ Whitelist role úspěšně přidána`);
                    }
                } else if (status === 'rejected') {
                    // Pro zamítnutí: odebereme whitelist roli (pokud existuje) a také waiting roli
                    console.log(`🚫 Odebírám whitelist roli (pokud existuje) a waiting roli...`);
                    const removedWhitelist = await removeWhitelistRole(applicantDiscordId);
                    const removedWaiting = await removeWaitingRole(applicantDiscordId);
                    roleSuccess = removedWhitelist || removedWaiting; // true pokud se podařilo aspoň něco relevantního
                    if (!roleSuccess) {
                        console.warn(`⚠️ Nepodařilo se aktualizovat role pro odmítnutí (user ${applicantDiscordId})`);
                    } else {
                        console.log(`✅ Role aktualizovány pro odmítnutí (whitelist removed: ${removedWhitelist}, waiting removed: ${removedWaiting})`);
                    }
                } else if (status === 'pending') {
                    // Pro vrácení na čekání: odebereme whitelist roli (pokud existuje) a přidáme waiting roli
                    console.log(`⏳ Vrácení na čekání: odebírám whitelist roli a přidávám waiting roli...`);
                    const removedWhitelist = await removeWhitelistRole(applicantDiscordId);
                    const addedWaiting = await addWaitingRole(applicantDiscordId);
                    roleSuccess = removedWhitelist || addedWaiting;
                    if (!roleSuccess) {
                        console.warn(`⚠️ Nepodařilo se aktualizovat role pro pending (user ${applicantDiscordId})`);
                    } else {
                        console.log(`✅ Role aktualizovány pro pending (whitelist removed: ${removedWhitelist}, waiting added: ${addedWaiting})`);
                    }
                }
            } catch (error) {
                console.error("❌ Chyba při Discord integraci:", error);
                discordError = error instanceof Error ? error.message : 'Neznámá chyba';
                // Nepřerušujeme proces kvůli Discord chybě
            }
        } else {
            console.error(`❌ Nepodařilo se získat Discord ID pro whitelist žádost ${requestId}`);
            console.error(`User ID žádosti: ${whitelistRequest.user_id}`);
            discordError = 'Nepodařilo se získat Discord ID uživatele';
        }

        return NextResponse.json({
            message: status === 'approved' 
                ? 'Whitelist žádost byla schválena' 
                : status === 'rejected' 
                    ? 'Whitelist žádost byla odmítnuta' 
                    : 'Whitelist žádost byla vrácena na vyhodnocení',
            discordNotified: false,
            roleUpdated: roleSuccess,
            discordError: discordError,
            discordId: applicantDiscordId
        });
    } catch (error) {
        console.error("Error updating whitelist request:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET - Získat detail konkrétní whitelist žádosti
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

        // Získání Discord account ID a kontrola oprávnění
        const [accountRows] = await database.execute(
            "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
            [session.user.id]
        );

        const accountRow = Array.isArray(accountRows) ? (accountRows[0] as any) : null;
        const discordId = accountRow?.accountId;

        if (!discordId) {
            return NextResponse.json({ error: "No Discord account linked" }, { status: 404 });
        }

        // Získání rolí z Discord API a kontrola oprávnění
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

        const { id: requestId } = await params;

        const [rows] = await database.execute(
            "SELECT id, user_id, form_data, status, serial_number, created_at, updated_at FROM whitelist_requests WHERE id = ?",
            [requestId]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json(
                { error: "Whitelist žádost nenalezena" },
                { status: 404 }
            );
        }

        return NextResponse.json({ request: rows[0] });
    } catch (error) {
        console.error("Error fetching whitelist request:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}