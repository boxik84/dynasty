import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { webDb } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = webDb as any;

        const rows = await db
            .selectFrom("whitelist_requests")
            .select(["id", "status", "created_at", "updated_at"])
            .where("user_id", "=", session.user.id)
            .orderBy("created_at", "desc")
            .limit(1)
            .execute();

        const request = rows[0];

        if (!request) {
            return NextResponse.json({
                hasRequest: false,
                status: null,
                message: "Žádná whitelist žádost nenalezena",
            });
        }

        return NextResponse.json({
            hasRequest: true,
            status: request.status,
            requestId: request.id,
            createdAt: toIso(request.created_at),
            updatedAt: toIso(request.updated_at),
            message: getStatusMessage(request.status),
        });
    } catch (error) {
        console.error("Error fetching whitelist status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

function getStatusMessage(status: string): string {
    switch (status) {
        case "pending":
            return "Žádost čeká se na vyhodnocení";
        case "approved":
            return "Schválená žádost";
        case "rejected":
            return "Zamítnutá žádost";
        default:
            return "Neznámý status žádosti";
    }
}

function toIso(value: unknown) {
    if (!value) {
        return value;
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    return value;
}
