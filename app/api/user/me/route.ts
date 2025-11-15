// app/api/user/me/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import database from "@/lib/db";
import { hasWhitelistPermissions } from "@/lib/utils";
import { getDiscordRoles } from "@/lib/discord"; // Použití nové pomocné funkce

const DISCORD_WHITELIST_ROLE_ID = process.env.DISCORD_WHITELIST_ROLE_ID!;
const DISCORD_BLACKLISTED_ROLE_ID = process.env.DISCORD_BLACKLISTED_ROLE_ID!;
const DISCORD_VEDENI_ROLE_ID = process.env.DISCORD_VEDENI_ROLE_ID!;
const DISCORD_STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID!;
const DISCORD_DEVELOPER_ROLE_ID = process.env.DISCORD_DEVELOPER_ROLE_ID!;
const DISCORD_WAITING_ROLE_ID = process.env.DISCORD_WAITING_ROLE_ID!;
const DISCORD_WHITELIST_ADDER_ROLE_ID = process.env.DISCORD_WHITELIST_ADDER_ROLE_ID!;
const DISCORD_HEAD_WHITELIST_ADDER_ROLE_ID = process.env.DISCORD_HEAD_WHITELIST_ADDER_ROLE_ID!;
const DISCORD_TRIAL_WHITELIST_ADDER_ROLE_ID = process.env.DISCORD_TRIAL_WHITELIST_ADDER_ROLE_ID!;

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [accountRows] = await database.execute(
            "SELECT a.accountId, u.name, u.email, u.image, a.createdAt, a.updatedAt FROM account a JOIN user u ON a.userId = u.id WHERE a.userId = ? AND a.providerId = 'discord' LIMIT 1",
            [session.user.id]
        );

        const account = (accountRows as any[])[0];

        if (!account?.accountId) {
            return NextResponse.json({ error: "No Discord account linked" }, { status: 404 });
        }

        const roles = await getDiscordRoles(account.accountId, true);
        
        const hasWhitelist = roles.includes(DISCORD_WHITELIST_ROLE_ID);
        const hasVedeniRole = roles.includes(DISCORD_VEDENI_ROLE_ID);
        const hasStaffRole = roles.includes(DISCORD_STAFF_ROLE_ID);
        const hasDeveloperRole = roles.includes(DISCORD_DEVELOPER_ROLE_ID);
        const hasWaitingRole = roles.includes(DISCORD_WAITING_ROLE_ID);
        const hasWhitelistAdderRole = roles.includes(DISCORD_WHITELIST_ADDER_ROLE_ID);
        const hasHeadWhitelistAdderRole = roles.includes(DISCORD_HEAD_WHITELIST_ADDER_ROLE_ID);
        const hasTrialWhitelistAdderRole = roles.includes(DISCORD_TRIAL_WHITELIST_ADDER_ROLE_ID);
        const isBlacklisted = roles.includes(DISCORD_BLACKLISTED_ROLE_ID);

        const permissions = {
            hasVedeniRole,
            hasStaffRole,
            hasDeveloperRole,
            hasWaitingRole,
            isBlacklisted,
            hasWhitelistPermissions: hasWhitelistPermissions(roles),
            hasVedeniOrStaffPermissions: hasVedeniRole || hasStaffRole,
            hasWhitelistAdderPermissions: hasWhitelistAdderRole || hasHeadWhitelistAdderRole || hasTrialWhitelistAdderRole,
            isAdmin: hasVedeniRole || hasDeveloperRole,
        };

        return NextResponse.json({
            userId: session.user.id,
            discordId: account.accountId,
            username: account.name,
            email: account.email,
            image: account.image,
            roles,
            hasWhitelist,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
            sessionId: session.session.id,
            sessionExpiresAt: session.session.expiresAt,
            permissions,
        });
    } catch (err) {
        console.error("Chyba při získávání informací o uživateli:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}