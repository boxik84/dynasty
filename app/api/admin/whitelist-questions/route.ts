import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import database from '@/lib/db'
import { getDiscordRoles } from '@/lib/discord'

async function verifyAdmin(session: any): Promise<boolean> {
    if (!session?.user?.id) {
        return false;
    }
    const adminRoles = [
        process.env.DISCORD_VEDENI_ROLE_ID,
        process.env.DISCORD_DEVELOPER_ROLE_ID,
    ].filter(Boolean);

    const userDiscordRoles = await getDiscordRoles(session.user.id);
    return userDiscordRoles.some((roleId: string) => adminRoles.includes(roleId));
}

// GET - Získat všechny whitelist otázky
export async function GET() {
    try {
        const [rows] = await database.execute(`
            SELECT * FROM whitelist_questions 
            ORDER BY order_index ASC, id ASC
        `)
        const questions = (rows as any[]).map(q => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));
        return NextResponse.json({ questions });
    } catch (error) {
        console.error('Error fetching whitelist questions:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Vytvořit novou whitelist otázku
export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!await verifyAdmin(session)) {
        return NextResponse.json({ error: 'Admin permissions required' }, { status: 403 });
    }

    try {
        const body = await req.json()
        const {
            question, field_name, field_type, placeholder, required, category,
            options, min_value, max_value, min_length, max_length, 
            order_index, is_active
        } = body

        if (!question || !field_name || !field_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }
        
        const [existing] = await database.execute('SELECT id FROM whitelist_questions WHERE field_name = ?', [field_name]);
        if (Array.isArray(existing) && existing.length > 0) {
            return NextResponse.json({ error: 'Field name already exists' }, { status: 409 });
        }

        const [result] = await database.execute(`
            INSERT INTO whitelist_questions (
                question, field_name, field_type, placeholder, required, category,
                options, min_value, max_value, min_length, max_length, 
                order_index, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            question, field_name, field_type, placeholder, 
            required, category, options ? JSON.stringify(options) : null, 
            min_value, max_value, min_length, max_length, 
            order_index, is_active
        ]);

        return NextResponse.json({ message: 'Question created', id: (result as any).insertId }, { status: 201 });

    } catch (error) {
        console.error('Error creating whitelist question:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Hromadná aktualizace (např. pořadí)
export async function PATCH(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!await verifyAdmin(session)) {
        return NextResponse.json({ error: 'Admin permissions required' }, { status: 403 });
    }

    try {
        const { updates } = await req.json();

        if (!Array.isArray(updates) || updates.length === 0) {
            return NextResponse.json({ error: 'Invalid payload, expected "updates" array' }, { status: 400 });
        }

        const connection = await database.getConnection();
        await connection.beginTransaction();

        try {
            for (const update of updates) {
                if (update.id === undefined || update.order_index === undefined) {
                    throw new Error('Invalid update object. Missing id or order_index.');
                }
                await connection.execute(
                    'UPDATE whitelist_questions SET order_index = ? WHERE id = ?',
                    [update.order_index, update.id]
                );
            }
            await connection.commit();
            connection.release();
            return NextResponse.json({ message: 'Questions order updated successfully' });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error; // Re-throw to be caught by outer catch
        }
    } catch (error) {
        console.error('Error bulk updating questions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 