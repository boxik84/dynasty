import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import database from "@/lib/db";
import axios from "axios";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_WHITELIST_ROLE_ID = process.env.DISCORD_WHITELIST_ROLE_ID!;
const DISCORD_WAITING_ROLE_ID = process.env.DISCORD_WAITING_ROLE_ID!;

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Získání Discord ID aktuálního uživatele
        const [accountRows] = await database.execute(
            "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
            [session.session.userId]
        );

        const accountRow = Array.isArray(accountRows) ? (accountRows[0] as any) : null;
        const discordId = accountRow?.accountId;

        if (!discordId) {
            return NextResponse.json({ error: "No Discord account linked" }, { status: 404 });
        }

        // Debug informace
        const debugInfo: any = {
            currentUser: {
                userId: session.session.userId,
                discordId: discordId
            },
            environmentVariables: {
                DISCORD_GUILD_ID,
                DISCORD_BOT_TOKEN: DISCORD_BOT_TOKEN ? `${DISCORD_BOT_TOKEN.substring(0, 20)}...` : 'MISSING',
                DISCORD_WHITELIST_ROLE_ID,
                DISCORD_WAITING_ROLE_ID
            }
        };

        try {
            // Test Discord API - získání informací o uživateli
            const memberResponse = await axios.get(
                `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
                {
                    headers: {
                        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                    },
                }
            );

            const memberData = memberResponse.data;
            debugInfo.discordMember = {
                username: memberData.user.username,
                discriminator: memberData.user.discriminator,
                roles: memberData.roles,
                hasWhitelistRole: memberData.roles.includes(DISCORD_WHITELIST_ROLE_ID),
                hasWaitingRole: memberData.roles.includes(DISCORD_WAITING_ROLE_ID)
            };

            // Test přidání role (DRY RUN - jenom test, nepřidáváme)
            try {
                const roleTestResponse = await axios.get(
                    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/roles`,
                    {
                        headers: {
                            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                        },
                    }
                );

                const allRoles = roleTestResponse.data;
                const whitelistRole = allRoles.find((role: any) => role.id === DISCORD_WHITELIST_ROLE_ID);
                const waitingRole = allRoles.find((role: any) => role.id === DISCORD_WAITING_ROLE_ID);

                debugInfo.discordRoles = {
                    whitelistRole: whitelistRole ? {
                        name: whitelistRole.name,
                        id: whitelistRole.id,
                        position: whitelistRole.position
                    } : 'ROLE NOT FOUND',
                    waitingRole: waitingRole ? {
                        name: waitingRole.name,
                        id: waitingRole.id,
                        position: waitingRole.position
                    } : 'ROLE NOT FOUND'
                };

                // Test bot permissions
                const botMemberResponse = await axios.get(
                    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/@me`,
                    {
                        headers: {
                            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                        },
                    }
                );

                const botData = botMemberResponse.data;
                const botRoles = allRoles.filter((role: any) => botData.roles.includes(role.id));
                const highestBotRole = botRoles.reduce((highest: any, role: any) => 
                    role.position > highest.position ? role : highest, 
                    { position: 0 }
                );

                debugInfo.botInfo = {
                    username: botData.user.username,
                    roles: botRoles.map((role: any) => ({ name: role.name, position: role.position })),
                    highestRolePosition: highestBotRole.position,
                    canManageWhitelistRole: whitelistRole ? highestBotRole.position > whitelistRole.position : false,
                    canManageWaitingRole: waitingRole ? highestBotRole.position > waitingRole.position : false
                };

            } catch (roleError: any) {
                debugInfo.roleTestError = roleError?.response?.data || roleError?.message;
            }

        } catch (apiError: any) {
            debugInfo.discordApiError = apiError?.response?.data || apiError?.message;
        }

        return NextResponse.json(debugInfo);

    } catch (error: any) {
        console.error("Debug error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error?.message },
            { status: 500 }
        );
    }
} 