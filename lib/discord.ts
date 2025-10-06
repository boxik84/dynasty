import database from "./db";

const discordApiBaseUrl = 'https://discord.com/api/v10';
const botToken = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;

interface DiscordMember {
    roles: string[];
}

// Cache pro role, aby se nevolalo Discord API zbytečně často
const roleCache = new Map<string, { roles: string[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minut

/**
 * Získá Discord ID uživatele na základě jeho interního ID účtu.
 * @param userId Interní ID uživatele.
 * @returns Discord ID nebo null, pokud nebylo nalezeno.
 */
async function getDiscordIdByUserId(userId: string): Promise<string | null> {
    const result = await database.execute(
        'SELECT accountId FROM account WHERE userId = ? AND providerId = "discord"',
        [userId]
    );
    const rows = result[0] as { accountId: string }[];
    return rows.length > 0 ? rows[0].accountId : null;
}

/**
 * Získá role uživatele z Discord API.
 * @param discordId Discord ID uživatele.
 * @returns Pole ID rolí nebo prázdné pole.
 */
async function fetchDiscordRoles(discordId: string): Promise<string[]> {
    if (!botToken || !guildId) {
        console.error("Missing Discord environment variables (BOT_TOKEN or GUILD_ID)");
        return [];
    }

    // Kontrola cache
    const cached = roleCache.get(discordId);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.roles;
    }

    try {
        const response = await fetch(`${discordApiBaseUrl}/guilds/${guildId}/members/${discordId}`, {
            headers: {
                Authorization: `Bot ${botToken}`,
            },
            next: { revalidate: 300 } // Revalidace po 5 minutách
        });

        if (!response.ok) {
            // Pokud uživatel není na serveru, vrátí 404, což je očekávané chování
            if (response.status === 404) {
                return [];
            }
            console.error(`Error fetching Discord roles for ${discordId}: ${response.status} ${response.statusText}`);
            return [];
        }

        const member: DiscordMember = await response.json();
        const roles = member.roles || [];

        // Uložení do cache
        roleCache.set(discordId, { roles, timestamp: Date.now() });

        return roles;
    } catch (error) {
        console.error(`Exception fetching Discord roles for ${discordId}:`, error);
        return [];
    }
}

/**
 * Získá role uživatele na základě jeho ID (buď interního, nebo přímo Discord ID).
 * @param id - Interní ID uživatele nebo Discord ID.
 * @param isDiscordId - Příznak, zda je předané ID již Discord ID. Výchozí je false.
 * @returns Pole ID rolí.
 */
export async function getDiscordRoles(id: string, isDiscordId: boolean = false): Promise<string[]> {
    try {
        const discordId = isDiscordId ? id : await getDiscordIdByUserId(id);

        if (!discordId) {
            return [];
        }

        return await fetchDiscordRoles(discordId);
    } catch (error) {
        console.error("Error in getDiscordRoles:", error);
        return [];
    }
} 