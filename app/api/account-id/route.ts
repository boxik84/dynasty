import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import database from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import { sendDiscordLog } from "@/lib/discord-log";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.session?.userId) {
    await sendDiscordLog({
      title: "API ERROR /api/account-id",
      description: "Neautorizovaný přístup.",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [rows] = await database.execute(
    "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
    [session.session.userId]
  );

  const result = rows as RowDataPacket[];
  const accountId = result[0]?.accountId;

  if (!accountId) {
    await sendDiscordLog({
      title: "API ERROR /api/account-id",
      description: `AccountId nenalezen pro userId: ${session.session.userId}`,
    });
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  await sendDiscordLog({
    title: "API GET /api/account-id",
    description: `Získán accountId pro userId: ${session.session.userId}`,
    fields: [
      { name: "accountId", value: String(accountId), inline: true }
    ]
  });
  return NextResponse.json({ accountId });
}