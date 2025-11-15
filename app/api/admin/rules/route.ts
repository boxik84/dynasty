import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import database from '@/lib/db'
import axios from 'axios'

// GET - Získat všechna pravidla (admin only)
export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        
        if (!session?.session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check admin permissions by checking Discord roles directly
        const [accountRows] = await database.execute(
            "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
            [session.session.userId]
        );

        const accountRow = Array.isArray(accountRows) ? (accountRows[0] as any) : null;
        const discordId = accountRow?.accountId;

        if (!discordId) {
            return NextResponse.json({ error: "No Discord account linked" }, { status: 404 });
        }

        // Get user roles and check permissions directly
        const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
        const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
        const DISCORD_VEDENI_ROLE_ID = process.env.DISCORD_VEDENI_ROLE_ID!;
        const DISCORD_STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID!;
        const DISCORD_DEVELOPER_ROLE_ID = process.env.DISCORD_DEVELOPER_ROLE_ID!;

        try {
            const memberResponse = await axios.get(
                `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
                {
                    headers: {
                        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                    },
                }
            );

            const userRoles: string[] = memberResponse.data.roles || [];
            const isAdmin = userRoles.includes(DISCORD_VEDENI_ROLE_ID) || 
                           userRoles.includes(DISCORD_STAFF_ROLE_ID) || 
                           userRoles.includes(DISCORD_DEVELOPER_ROLE_ID);

            if (!isAdmin) {
                return NextResponse.json({ error: 'Admin permissions required' }, { status: 403 });
            }
        } catch (error) {
            console.error("Error fetching Discord roles:", error);
            return NextResponse.json({ error: "Error verifying permissions" }, { status: 500 });
        }

        // Get rules from database
        const [sections] = await database.execute(`
            SELECT * FROM rule_sections 
            ORDER BY order_index ASC
        `)

        const [rules] = await database.execute(`
            SELECT * FROM rules 
            ORDER BY section_id ASC, order_index ASC
        `)

        const [subcategories] = await database.execute(`
            SELECT * FROM rule_subcategories 
            ORDER BY section_id ASC, order_index ASC
        `)

        return NextResponse.json({ 
            sections, 
            rules, 
            subcategories 
        })
    } catch (error) {
        console.error('Error fetching rules:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Vytvořit nové pravidlo (admin only)
export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        
        if (!session?.session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check admin permissions by checking Discord roles directly
        const [accountRows] = await database.execute(
            "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
            [session.session.userId]
        );

        const accountRow = Array.isArray(accountRows) ? (accountRows[0] as any) : null;
        const discordId = accountRow?.accountId;

        if (!discordId) {
            return NextResponse.json({ error: "No Discord account linked" }, { status: 404 });
        }

        // Get user roles and check permissions directly
        const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
        const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
        const DISCORD_VEDENI_ROLE_ID = process.env.DISCORD_VEDENI_ROLE_ID!;
        const DISCORD_STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID!;
        const DISCORD_DEVELOPER_ROLE_ID = process.env.DISCORD_DEVELOPER_ROLE_ID!;

        try {
            const memberResponse = await axios.get(
                `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
                {
                    headers: {
                        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                    },
                }
            );

            const userRoles: string[] = memberResponse.data.roles || [];
            const isAdmin = userRoles.includes(DISCORD_VEDENI_ROLE_ID) || 
                           userRoles.includes(DISCORD_STAFF_ROLE_ID) || 
                           userRoles.includes(DISCORD_DEVELOPER_ROLE_ID);

            if (!isAdmin) {
                return NextResponse.json({ error: 'Admin permissions required' }, { status: 403 });
            }
        } catch (error) {
            console.error("Error fetching Discord roles:", error);
            return NextResponse.json({ error: "Error verifying permissions" }, { status: 500 });
        }

        const body = await req.json()
        const { type, data } = body

        if (type === 'section') {
            const { id, title, icon, order_index } = data

            if (!id || !title) {
                return NextResponse.json({ error: 'Missing required fields for section' }, { status: 400 })
            }

            // Insert or update section
            await database.execute(`
                INSERT INTO rule_sections (id, title, icon, order_index, created_at, updated_at) 
                VALUES (?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE 
                title = VALUES(title), 
                icon = VALUES(icon), 
                order_index = VALUES(order_index),
                updated_at = NOW()
            `, [id, title, icon || null, order_index || 0])

            return NextResponse.json({ message: 'Section saved successfully' })

        } else if (type === 'rule') {
            const { id, section_id, subcategory_id, content, order_index } = data

            if (!section_id || !content) {
                return NextResponse.json({ error: 'Missing required fields for rule' }, { status: 400 })
            }

            if (id) {
                // Update existing rule
                await database.execute(`
                    UPDATE rules 
                    SET section_id = ?, subcategory_id = ?, content = ?, order_index = ?, updated_at = NOW()
                    WHERE id = ?
                `, [section_id, subcategory_id || null, content, order_index || 0, id])

                return NextResponse.json({ message: 'Rule updated successfully' })
            } else {
                // Create new rule
                const [result] = await database.execute(`
                    INSERT INTO rules (section_id, subcategory_id, content, order_index, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, NOW(), NOW())
                `, [section_id, subcategory_id || null, content, order_index || 0])

                return NextResponse.json({ 
                    message: 'Rule created successfully',
                    id: (result as any).insertId
                })
            }

        } else if (type === 'subcategory') {
            const { section_id, id, title, icon, order_index } = data

            if (!section_id || !id || !title) {
                return NextResponse.json({ error: 'Missing required fields for subcategory' }, { status: 400 })
            }

            await database.execute(`
                INSERT INTO rule_subcategories (section_id, id, title, icon, order_index, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE 
                title = VALUES(title), 
                icon = VALUES(icon), 
                order_index = VALUES(order_index),
                updated_at = NOW()
            `, [section_id, id, title, icon || null, order_index || 0])

            return NextResponse.json({ message: 'Subcategory saved successfully' })

        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

    } catch (error) {
        console.error('Error creating rule:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 

// PATCH - Hromadná aktualizace pořadí (admin only)
export async function PATCH(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        
        if (!session?.session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Admin check (similar to GET/POST)
        const [accountRows] = await database.execute(
            "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
            [session.session.userId]
        );

        const accountRow = Array.isArray(accountRows) ? (accountRows[0] as any) : null;
        const discordId = accountRow?.accountId;

        if (!discordId) {
            return NextResponse.json({ error: "No Discord account linked" }, { status: 404 });
        }

        const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
        const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
        const DISCORD_VEDENI_ROLE_ID = process.env.DISCORD_VEDENI_ROLE_ID!;
        const DISCORD_STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID!;
        const DISCORD_DEVELOPER_ROLE_ID = process.env.DISCORD_DEVELOPER_ROLE_ID!;

        try {
            const memberResponse = await axios.get(
                `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
                {
                    headers: {
                        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                    },
                }
            );

            const userRoles: string[] = memberResponse.data.roles || [];
            const isAdmin = userRoles.includes(DISCORD_VEDENI_ROLE_ID) || 
                           userRoles.includes(DISCORD_STAFF_ROLE_ID) || 
                           userRoles.includes(DISCORD_DEVELOPER_ROLE_ID);

            if (!isAdmin) {
                return NextResponse.json({ error: 'Admin permissions required' }, { status: 403 });
            }
        } catch (error) {
            console.error("Error fetching Discord roles:", error);
            return NextResponse.json({ error: "Error verifying permissions" }, { status: 500 });
        }
        
        const { type, items } = await req.json();

        if (!type || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }
        
        const tableNameMap: { [key: string]: string } = {
            rules: 'rules',
            sections: 'rule_sections',
            subcategories: 'rule_subcategories'
        };

        const tableName = tableNameMap[type];

        if (!tableName) {
            return NextResponse.json({ error: 'Invalid type specified' }, { status: 400 });
        }

        const connection = await database.getConnection();
        try {
            await connection.beginTransaction();
            for (const item of items) {
                if (typeof item.id === 'undefined' || typeof item.order_index !== 'number') {
                    throw new Error('Invalid item structure in payload');
                }
                await connection.execute(
                    `UPDATE \`${tableName}\` SET order_index = ? WHERE id = ?`,
                    [item.order_index, item.id]
                );
            }
            await connection.commit();
            return NextResponse.json({ message: 'Order updated successfully' });
        } catch (error) {
            await connection.rollback();
            console.error('Error updating order:', error);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error in PATCH route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Smazat pravidlo, sekci nebo podkategorii (admin only)
export async function DELETE(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        
        if (!session?.session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Admin check (similar to GET/POST)
        const [accountRows] = await database.execute(
            "SELECT accountId FROM account WHERE userId = ? AND providerId = 'discord' LIMIT 1",
            [session.session.userId]
        );

        const accountRow = Array.isArray(accountRows) ? (accountRows[0] as any) : null;
        const discordId = accountRow?.accountId;

        if (!discordId) {
            return NextResponse.json({ error: "No Discord account linked" }, { status: 404 });
        }

        const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
        const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
        const DISCORD_VEDENI_ROLE_ID = process.env.DISCORD_VEDENI_ROLE_ID!;
        const DISCORD_STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID!;
        const DISCORD_DEVELOPER_ROLE_ID = process.env.DISCORD_DEVELOPER_ROLE_ID!;

        try {
            const memberResponse = await axios.get(
                `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
                {
                    headers: {
                        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                    },
                }
            );

            const userRoles: string[] = memberResponse.data.roles || [];
            const isAdmin = userRoles.includes(DISCORD_VEDENI_ROLE_ID) || 
                           userRoles.includes(DISCORD_STAFF_ROLE_ID) || 
                           userRoles.includes(DISCORD_DEVELOPER_ROLE_ID);

            if (!isAdmin) {
                return NextResponse.json({ error: 'Admin permissions required' }, { status: 403 });
            }
        } catch (error) {
            console.error("Error fetching Discord roles:", error);
            return NextResponse.json({ error: "Error verifying permissions" }, { status: 500 });
        }

        const { type, id } = await req.json()

        if (!type || !id) {
            return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
        }

        if (type === 'section') {
            // Optional: consider what to do with rules/subcategories in this section
            await database.execute('DELETE FROM rule_sections WHERE id = ?', [id])
            // Also delete related subcategories and rules
            await database.execute('DELETE FROM rule_subcategories WHERE section_id = ?', [id])
            await database.execute('DELETE FROM rules WHERE section_id = ?', [id])
            return NextResponse.json({ message: 'Section and its contents deleted successfully' })

        } else if (type === 'rule') {
            await database.execute('DELETE FROM rules WHERE id = ?', [id])
            return NextResponse.json({ message: 'Rule deleted successfully' })

        } else if (type === 'subcategory') {
            // Optional: consider what to do with rules in this subcategory
            await database.execute('DELETE FROM rule_subcategories WHERE id = ?', [id])
            // Also delete related rules
            await database.execute('DELETE FROM rules WHERE subcategory_id = ?', [id])
            return NextResponse.json({ message: 'Subcategory and its rules deleted successfully' })

        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

    } catch (error) {
        console.error('Error deleting item:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 