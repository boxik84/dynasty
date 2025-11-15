import { NextResponse } from 'next/server';
import axios from 'axios';
import { sendDiscordLog } from "@/lib/discord-log";

interface Member {
  id: string;
  username: string;
  avatar: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roleId = searchParams.get('roleId');

  // Validace roleId
  if (!roleId) {
    await sendDiscordLog({
      title: "API ERROR /api/members-by-role",
      description: "Chybí roleId v parametru.",
    });
    return NextResponse.json({ error: 'roleId is required' }, { status: 400 });
  }

  try {
    // Načtení členů serveru z Discord API
    const response = await axios.get(`https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID_A_TEAM_DISCORD}/members`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      params: {
        limit: 1000, // Maximum členů na požadavek
      },
    });

    const discordMembers = response.data;

    // Filtrování členů s danou rolí a formátování
    const members: Member[] = discordMembers
      .filter((member: any) => member.roles.includes(roleId))
      .map((member: any) => ({
        id: member.user.id,
        username: member.user.username,
        avatar: member.user.avatar
          ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}`
          : null,
      }));

    await sendDiscordLog({
      title: "API GET /api/members-by-role",
      description: `Získání členů s rolí ${roleId}`,
      fields: [
        { name: "Počet členů", value: String(members.length), inline: true }
      ]
    });
    return NextResponse.json({ members });
  } catch (error) {
    await sendDiscordLog({
      title: "API ERROR /api/members-by-role",
      description: "Chyba při získávání členů podle role.",
      fields: [
        { name: "Error", value: String(error) }
      ]
    });
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}