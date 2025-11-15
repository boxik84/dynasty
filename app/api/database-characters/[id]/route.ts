import { NextRequest, NextResponse } from "next/server";
import database from "@/lib/db";
import databasefivem from "@/lib/db-fivem";
import { auth } from "@/lib/auth";
import axios from "axios";
import { sendDiscordLog } from "@/lib/discord-log";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const REQUIRED_ROLE_ID = "1333440253381316660";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.session?.userId) {
    await sendDiscordLog({
      title: "API ERROR /api/database-characters/[id] PATCH",
      description: "Neautorizovaný přístup.",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessionUserId = session.session.userId;
    const [rows] = await database.execute(
      "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
      [sessionUserId]
    );
    const accountId = Array.isArray(rows) ? (rows[0] as any)?.accountId : null;
    if (!accountId) {
      await sendDiscordLog({
        title: "API ERROR /api/database-characters/[id] PATCH",
        description: "Discord účet nenalezen v databázi.",
      });
      return NextResponse.json({ error: "Discord účet nenalezen v databázi." }, { status: 404 });
    }

    console.log("DISCORD ID ze session:", accountId);

    let memberResponse;
    try {
      memberResponse = await axios.get(
        `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${accountId}`,
        {
          headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          },
        }
      );
    } catch (err) {
      // Debug: log error from Discord API
      let detail = String(err);
      if (axios.isAxiosError(err)) {
        detail = JSON.stringify(err.response?.data || err.toJSON());
      }
      console.error("Chyba při volání Discord API:", detail);
      return NextResponse.json({
        error: "Chyba při volání Discord API",
        detail
      }, { status: 500 });
    }

    console.log("Discord API response:", memberResponse.data);

    const userRoles = memberResponse.data.roles || [];
    if (!userRoles.includes(REQUIRED_ROLE_ID)) {
      await sendDiscordLog({
        title: "API ERROR /api/database-characters/[id] PATCH",
        description: "Uživatel nemá požadovanou roli pro úpravu jmen.",
        fields: [
          { name: "User ID", value: accountId, inline: true },
          { name: "Required Role", value: REQUIRED_ROLE_ID, inline: true },
          { name: "User Roles", value: JSON.stringify(userRoles), inline: false }
        ]
      });
      return NextResponse.json({ error: "Insufficient permissions", userRoles }, { status: 403 });
    }

    const { id } = await params;

    const { firstname, lastname } = await req.json();
    if (!firstname || !lastname) {
      await sendDiscordLog({
        title: "API ERROR /api/database-characters/[id] PATCH",
        description: "Chybí jméno nebo příjmení.",
      });
      return NextResponse.json(
        { error: "Chybí jméno nebo příjmení." },
        { status: 400 }
      );
    }

    try {
      await databasefivem.execute(
        "UPDATE users SET firstname = ?, lastname = ? WHERE id = ?",
        [firstname, lastname, id]
      );

      await sendDiscordLog({
        title: "API PATCH /api/database-characters/[id]",
        description: "Jméno postavy bylo úspěšně změněno.",
        fields: [
          { name: "Character ID", value: id, inline: true },
          { name: "New Name", value: `${firstname} ${lastname}`, inline: true },
          { name: "Changed By", value: accountId, inline: true }
        ]
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      await sendDiscordLog({
        title: "API ERROR /api/database-characters/[id] PATCH",
        description: "Chyba při aktualizaci jména.",
        fields: [
          { name: "Error", value: String(error) }
        ]
      });

      console.error("Chyba při aktualizaci jména:", error);
      return NextResponse.json(
        { error: "Chyba serveru", detail: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    await sendDiscordLog({
      title: "API ERROR /api/database-characters/[id] PATCH",
      description: "Chyba při ověřování rolí.",
      fields: [
        { name: "Error", value: String(error) }
      ]
    });
    // Debug: log catch-all error
    console.error("Obecná chyba:", error);
    return NextResponse.json(
      { error: "Chyba při ověřování oprávnění", detail: String(error) },
      { status: 500 }
    );
  }
}
