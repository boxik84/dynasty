import { NextResponse } from "next/server";
import databasefivem from "@/lib/db-fivem";
import database from "@/lib/db";
import axios from "axios";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const WHITELIST_ROLE_ID = process.env.DISCORD_WHITELIST_ROLE_ID;

export async function GET() {
  try {
    const [users] = await databasefivem.execute("SELECT * FROM users");
    const totalCharacters = Array.isArray(users) ? users.length : 0;

    const totalMoney = Array.isArray(users) ? users.reduce((sum: number, user: any) => {
      const money = JSON.parse(user.accounts || '{}').money || 0;
      return sum + parseInt(money, 10);
    }, 0) : 0;

    const totalBank = Array.isArray(users) ? users.reduce((sum: number, user: any) => {
      const bank = JSON.parse(user.accounts || '{}').bank || 0;
      return sum + parseInt(bank, 10);
    }, 0) : 0;

    const totalBlack = Array.isArray(users) ? users.reduce((sum: number, user: any) => {
      const black = JSON.parse(user.accounts || '{}').black_money || 0;
      return sum + parseInt(black, 10);
    }, 0) : 0;

    const [vehicles] = await databasefivem.execute("SELECT COUNT(*) as count FROM owned_vehicles");
    const totalVehicles = Array.isArray(vehicles) && vehicles[0] ? (vehicles[0] as any).count : 0;

    const discordHeaders = { Authorization: `Bot ${DISCORD_BOT_TOKEN}` };
    let totalDiscordMembers = 0;
    let totalWhitelisted = 0;

    try {
      const guildResponse = await axios.get(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}?with_counts=true`, { headers: discordHeaders });
      totalDiscordMembers = guildResponse.data.approximate_member_count || 0;
    } catch {
      // Ignore Discord API errors
    }

    try {
      const whitelistMembersResponse = await axios.get(
        `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members?limit=1000`,
        { headers: discordHeaders }
      );
      if (Array.isArray(whitelistMembersResponse.data)) {
        totalWhitelisted = whitelistMembersResponse.data.filter((member: any) =>
          member.roles.includes(WHITELIST_ROLE_ID)
        ).length;
      }
    } catch {
      // Ignoruj chybu při whitelistu
    }

    // Získání počtu whitelist žádostí z databáze
    let totalWhitelistRequests = 0;
    let approvedWhitelistRequests = 0;
    try {
      const [requestsCount] = await database.execute(
        "SELECT COUNT(*) as total FROM whitelist_requests"
      );
      totalWhitelistRequests = Array.isArray(requestsCount) && requestsCount[0] ? (requestsCount[0] as any).total : 0;

      const [approvedCount] = await database.execute(
        "SELECT COUNT(*) as approved FROM whitelist_requests WHERE status = 'approved'"
      );
      approvedWhitelistRequests = Array.isArray(approvedCount) && approvedCount[0] ? (approvedCount[0] as any).approved : 0;
    } catch (error) {
      console.error("Error fetching whitelist stats:", error);
    }

    const launchDate = new Date("2025-02-05T00:00:00Z");
    const today = new Date();
    const daysRunning = Math.floor((today.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      totalBank,
      totalMoney,
      totalBlack,
      totalVehicles,
      totalCharacters,
      totalDiscordMembers,
      totalWhitelisted,
      totalWhitelistRequests,
      approvedWhitelistRequests,
      daysRunning,
    });
  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}