import { NextResponse } from "next/server";
import database from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import axios from "axios";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_DEVELOPER_ROLE_ID = process.env.DISCORD_DEVELOPER_ROLE_ID!;

export async function POST() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get Discord account ID
        const [accountRows] = await database.execute(
            "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
            [session.user.id]
        );

        const accountRow = Array.isArray(accountRows) ? (accountRows[0] as any) : null;
        const discordId = accountRow?.accountId;

        if (!discordId) {
            return NextResponse.json({ error: "No Discord account linked" }, { status: 404 });
        }

        // Check if user has developer role
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
            const hasDeveloperRole = userRoles.includes(DISCORD_DEVELOPER_ROLE_ID);

            if (!hasDeveloperRole) {
                return NextResponse.json({ error: "Developer role required" }, { status: 403 });
            }
        } catch (error) {
            console.error("Error fetching Discord roles:", error);
            return NextResponse.json({ error: "Error verifying permissions" }, { status: 500 });
        }

        // Check if serial_number column already exists
        const [columnCheck] = await database.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'whitelist_requests' 
            AND COLUMN_NAME = 'serial_number'
        `);

        if (Array.isArray(columnCheck) && columnCheck.length > 0) {
            return NextResponse.json({ 
                message: "Migration already completed",
                alreadyMigrated: true
            });
        }

        // Run migration
        await database.execute(`
            ALTER TABLE whitelist_requests 
            ADD COLUMN serial_number VARCHAR(20) UNIQUE NULL AFTER id
        `);

        await database.execute(`
            CREATE INDEX idx_whitelist_serial_number ON whitelist_requests(serial_number)
        `);

        // Update existing records with serial numbers
        const [existingRecords] = await database.execute(`
            SELECT id, created_at FROM whitelist_requests 
            WHERE serial_number IS NULL
            ORDER BY created_at ASC
        `);

        if (Array.isArray(existingRecords) && existingRecords.length > 0) {
            let counter = 1;
            for (const record of existingRecords) {
                const recordData = record as any;
                const year = new Date(recordData.created_at).getFullYear();
                const serialNumber = `WL-${year}-${counter.toString().padStart(4, '0')}`;
                
                await database.execute(`
                    UPDATE whitelist_requests 
                    SET serial_number = ? 
                    WHERE id = ? AND serial_number IS NULL
                `, [serialNumber, recordData.id]);
                
                counter++;
            }
        }

        return NextResponse.json({ 
            message: "Migration completed successfully",
            recordsUpdated: Array.isArray(existingRecords) ? existingRecords.length : 0
        });

    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json(
            { error: "Migration failed", details: (error as Error).message },
            { status: 500 }
        );
    }
} 