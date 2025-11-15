import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import database from '@/lib/db';

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { imageUrl, caption, contestId } = await req.json();

        if (!imageUrl || !contestId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Uložíme nový příspěvek do databáze se statusem 'pending'
        await database.execute(
            `INSERT INTO photo_submissions (contest_id, user_id, image_url, caption, status)
             VALUES (?, ?, ?, ?, 'pending')`,
            [contestId, session.user.id, imageUrl, caption]
        );

        return NextResponse.json({ message: 'Submission created successfully' }, { status: 201 });

    } catch (error) {
        console.error('Error creating photo submission:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 