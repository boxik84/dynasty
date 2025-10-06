import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import database from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { submissionId } = await req.json();

        if (!submissionId) {
            return new NextResponse('Missing submissionId', { status: 400 });
        }

        // Zjistíme, jestli uživatel už fotku lajkoval
        const [existingLikes] = await database.query<RowDataPacket[]>(
            'SELECT id FROM photo_likes WHERE submission_id = ? AND user_id = ?',
            [submissionId, userId]
        );

        let hasLiked: boolean;

        if (existingLikes.length > 0) {
            // Pokud lajk existuje, odebereme ho (unlike)
            await database.execute(
                'DELETE FROM photo_likes WHERE id = ?',
                [existingLikes[0].id]
            );
            hasLiked = false;
        } else {
            // Pokud lajk neexistuje, přidáme ho (like)
            await database.execute(
                'INSERT INTO photo_likes (submission_id, user_id) VALUES (?, ?)',
                [submissionId, userId]
            );
            hasLiked = true;
        }

        // Získáme nový celkový počet lajků pro daný příspěvek
        const [countResult] = await database.query<RowDataPacket[]>(
            'SELECT COUNT(*) as likeCount FROM photo_likes WHERE submission_id = ?',
            [submissionId]
        );
        const likeCount = countResult[0].likeCount;

        return NextResponse.json({
            likeCount,
            hasLiked,
        });

    } catch (error) {
        console.error('Error toggling like:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 