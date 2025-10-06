import { NextResponse } from "next/server";
import databasefivem from "@/lib/db-fivem";
import { sendDiscordLog } from "@/lib/discord-log";

export async function GET() {
  try {
    const [rows] = await databasefivem.execute(`
      SELECT 
        id,
        name,
        identifier,
        firstname,
        lastname,
        dateofbirth,
        sex,
        job,
        job_grade,
        phone_number,
        created_at,
        last_seen,
        steam_id,
        discord_id
      FROM users
      ORDER BY id DESC
    `);
    await sendDiscordLog({
      title: "API GET /api/database-characters",
      description: "Načtení všech postav z databáze.",
      fields: [
        { name: "Počet záznamů", value: String(Array.isArray(rows) ? rows.length : 0), inline: true }
      ]
    });
    return NextResponse.json(rows);
  } catch (error) {
    await sendDiscordLog({
      title: "API ERROR /api/database-characters",
      description: "Chyba při získávání postav.",
      fields: [
        { name: "Error", value: String(error) }
      ]
    });
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
} 