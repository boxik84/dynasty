import { NextResponse } from 'next/server';
import databasefivem from '@/lib/db-fivem';
import { sendDiscordLog } from "@/lib/discord-log";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const discordId = `discord:${searchParams.get('discordId')}`;

    if (!discordId) {
      await sendDiscordLog({
        title: "API ERROR /api/postavy",
        description: "Chybí Discord ID v parametru.",
      });
      return NextResponse.json({ error: 'Discord ID not provided' }, { status: 400 });
    }

    const [postavy] = await databasefivem.query(
      'SELECT firstname, lastname, identifier, name, accounts, dateofbirth, sex, height, created_at, last_seen, iban, steam_id FROM users WHERE discord_id = ?', [discordId]
    );

    await sendDiscordLog({
      title: "API GET /api/postavy",
      description: `Načtení postav pro Discord ID: ${discordId}`,
      fields: [
        { name: "Počet postav", value: String(Array.isArray(postavy) ? postavy.length : 0), inline: true }
      ]
    });
    return NextResponse.json({ postavy });
  } catch (error) {
    await sendDiscordLog({
      title: "API ERROR /api/postavy",
      description: "Chyba při získávání postav.",
      fields: [
        { name: "Error", value: String(error) }
      ]
    });
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}