import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import database from '@/lib/db';
import { getDiscordRoles } from "@/lib/discord";

const DISCORD_VEDENI_ROLE_ID = process.env.DISCORD_VEDENI_ROLE_ID!;
const DISCORD_DEVELOPER_ROLE_ID = process.env.DISCORD_DEVELOPER_ROLE_ID!;

async function checkAdminPermissions(userId: string): Promise<boolean> {
    const [accountRows] = await database.execute(
        "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
        [userId]
    );
    const account = (accountRows as any[])[0];
    if (!account?.accountId) return false;

    const roles = await getDiscordRoles(account.accountId, true);
    return roles.includes(DISCORD_VEDENI_ROLE_ID) || roles.includes(DISCORD_DEVELOPER_ROLE_ID);
}

// GET all submissions for a specific contest
export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const isAdmin = await checkAdminPermissions(session.user.id);
    if (!isAdmin) {
        return new NextResponse('Forbidden', { status: 403 });
    }
    
    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get('contestId');

    if (!contestId) {
        return new NextResponse('contestId is required', { status: 400 });
    }

    try {
        const [submissions] = await database.query(
            `SELECT
                s.*,
                u.name as user_name,
                u.image as user_image
            FROM photo_submissions s
            JOIN users u ON s.user_id = u.id
            WHERE s.contest_id = ?
            ORDER BY s.created_at DESC`,
            [contestId]
        );

        return NextResponse.json(submissions);
    } catch (error) {
        console.error(`Error fetching submissions for contest ${contestId}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 