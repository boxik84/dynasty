import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import database from '@/lib/db'

// GET - Získat všechny aktivity (admin only)
export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        
        if (!session?.session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check admin permissions
        const response = await fetch(`${req.url.split('/api')[0]}/api/user/me`, {
            headers: req.headers
        })
        
        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to verify permissions' }, { status: 403 })
        }

        const userData = await response.json()
        if (!userData.permissions?.isAdmin) {
            return NextResponse.json({ error: 'Admin permissions required' }, { status: 403 })
        }

        // Get activities from database
        const [rows] = await database.execute(`
            SELECT * FROM activities 
            ORDER BY created_at DESC
        `)

        return NextResponse.json({ activities: rows })
    } catch (error) {
        console.error('Error fetching activities:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Vytvořit novou aktivitu (admin only)
export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        
        if (!session?.session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check admin permissions
        const response = await fetch(`${req.url.split('/api')[0]}/api/user/me`, {
            headers: req.headers
        })
        
        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to verify permissions' }, { status: 403 })
        }

        const userData = await response.json()
        if (!userData.permissions?.isAdmin) {
            return NextResponse.json({ error: 'Admin permissions required' }, { status: 403 })
        }

        const body = await req.json()
        const {
            nazev,
            popis,
            obrazek,
            icon,
            odmena,
            vzdalenost,
            cas,
            riziko,
            rizikoLevel,
            category,
            span,
            gradient,
            borderColor,
            glowColor
        } = body

        // Validate required fields
        if (!nazev || !popis || !riziko || !rizikoLevel || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Insert into database
        const [result] = await database.execute(`
            INSERT INTO activities (
                nazev, popis, obrazek, icon, odmena, vzdalenost, cas, 
                riziko, riziko_level, category, span, gradient, 
                border_color, glow_color, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            nazev, popis, obrazek || null, icon || null, odmena || null,
            vzdalenost || null, cas || null, riziko, rizikoLevel, category,
            span || 1, gradient || null, borderColor || null, glowColor || null
        ])

        return NextResponse.json({ 
            message: 'Activity created successfully',
            id: (result as any).insertId
        })
    } catch (error) {
        console.error('Error creating activity:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 