import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import database from '@/lib/db'

// DELETE - Smazat aktivitu (admin only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const { id: activityId } = await params

        // Check if activity exists
        const [rows] = await database.execute(
            'SELECT id FROM activities WHERE id = ?',
            [activityId]
        )

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
        }

        // Delete activity
        await database.execute(
            'DELETE FROM activities WHERE id = ?',
            [activityId]
        )

        return NextResponse.json({ message: 'Activity deleted successfully' })
    } catch (error) {
        console.error('Error deleting activity:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT - Upravit aktivitu (admin only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const { id: activityId } = await params
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

        // Update activity
        await database.execute(`
            UPDATE activities SET 
                nazev = ?, popis = ?, obrazek = ?, icon = ?, odmena = ?, 
                vzdalenost = ?, cas = ?, riziko = ?, riziko_level = ?, 
                category = ?, span = ?, gradient = ?, border_color = ?, 
                glow_color = ?, updated_at = NOW()
            WHERE id = ?
        `, [
            nazev, popis, obrazek || null, icon || null, odmena || null,
            vzdalenost || null, cas || null, riziko, rizikoLevel, category,
            span || 1, gradient || null, borderColor || null, glowColor || null,
            activityId
        ])

        return NextResponse.json({ message: 'Activity updated successfully' })
    } catch (error) {
        console.error('Error updating activity:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 