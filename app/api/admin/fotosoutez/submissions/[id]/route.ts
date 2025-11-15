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

// PATCH to update a submission status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const isAdmin = await checkAdminPermissions(session.user.id);
    if (!isAdmin) {
        return new NextResponse('Forbidden', { status: 403 });
    }
    
    const { id: submissionId } = await params;
    const { status } = await req.json();

    if (!status || !['approved', 'rejected'].includes(status)) {
        return new NextResponse('Invalid status provided', { status: 400 });
    }

    try {
        await database.execute(
            'UPDATE photo_submissions SET status = ? WHERE id = ?',
            [status, submissionId]
        );

        return NextResponse.json({ message: 'Submission status updated' });
    } catch (error) {
        console.error(`Error updating submission ${submissionId}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 