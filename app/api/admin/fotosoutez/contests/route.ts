import { NextResponse } from 'next/server';
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

// GET all contests for admin view
export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const isAdmin = await checkAdminPermissions(session.user.id);
    if (!isAdmin) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    try {
        const [contests] = await database.query(
            `SELECT c.*, COUNT(s.id) as submission_count 
             FROM photo_contests c
             LEFT JOIN photo_submissions s ON c.id = s.contest_id
             GROUP BY c.id
             ORDER BY c.created_at DESC`
        );
        return NextResponse.json(contests);
    } catch (error) {
        console.error('Error fetching contests for admin:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// POST to create a new contest
export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const isAdmin = await checkAdminPermissions(session.user.id);
    if (!isAdmin) {
        return new NextResponse('Forbidden', { status: 403 });
    }
    
    try {
        const { title, description, endDate } = await req.json();
        if (!title) {
            return new NextResponse('Title is required', { status: 400 });
        }

        const [result] = await database.execute(
            'INSERT INTO photo_contests (title, description, end_date) VALUES (?, ?, ?)',
            [title, description, endDate || null]
        );
        
        return NextResponse.json({ message: 'Contest created', result }, { status: 201 });

    } catch (error) {
        console.error('Error creating contest:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 