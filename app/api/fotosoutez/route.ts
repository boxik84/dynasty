import { NextResponse, NextRequest } from 'next/server';
import database from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { auth } from '@/lib/auth';

// Definice datových struktur pro lepší přehlednost
interface PhotoSubmission {
    id: number;
    user_id: string;
    user_name: string;
    user_image: string;
    image_url: string;
    caption: string | null;
    created_at: string;
    like_count: number;
    has_liked: boolean;
}

interface PhotoContest {
    id: number;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    status: 'open' | 'judging' | 'closed';
    submissions: PhotoSubmission[];
}


export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        const userId = session?.user?.id;

        // Získáme všechny aktivní nebo probíhající soutěže
        const [contests] = await database.query<RowDataPacket[]>(`
            SELECT * FROM photo_contests
            WHERE status IN ('open', 'judging')
            ORDER BY start_date DESC
        `);

        const results: PhotoContest[] = [];

        // Pro každou soutěž načteme schválené příspěvky, jejich autory a počet lajků
        for (const contest of contests) {
            const [submissions] = await database.query<RowDataPacket[]>(`
                SELECT
                    ps.id,
                    ps.user_id,
                    ps.image_url,
                    ps.caption,
                    ps.created_at,
                    u.name as user_name,
                    u.image as user_image,
                    (SELECT COUNT(*) FROM photo_likes pl WHERE pl.submission_id = ps.id) as like_count,
                    ${userId ? `(SELECT COUNT(*) FROM photo_likes pl WHERE pl.submission_id = ps.id AND pl.user_id = ?) > 0` : 'false'} as has_liked
                FROM photo_submissions ps
                JOIN users u ON ps.user_id = u.id
                WHERE ps.contest_id = ? AND ps.status = 'approved'
                ORDER BY ps.created_at DESC
            `, userId ? [userId, contest.id] : [contest.id]);

            results.push({
                id: contest.id,
                title: contest.title,
                description: contest.description,
                start_date: contest.start_date,
                end_date: contest.end_date,
                status: contest.status,
                submissions: submissions.map(s => ({
                    ...s,
                    has_liked: !!s.has_liked
                })) as PhotoSubmission[],
            });
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('Chyba při načítání dat pro fotosoutěž:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 