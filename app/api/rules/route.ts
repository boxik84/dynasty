import { NextResponse } from 'next/server'
import database from '@/lib/db'

// GET - Získat všechna pravidla, sekce a podkategorie pro veřejné zobrazení
export async function GET() {
    try {
        const [sections] = await database.execute(`
            SELECT id, title, icon, order_index FROM rule_sections 
            ORDER BY order_index ASC
        `)

        const [rules] = await database.execute(`
            SELECT id, section_id, subcategory_id, content, order_index FROM rules 
            ORDER BY order_index ASC
        `)

        const [subcategories] = await database.execute(`
            SELECT id, section_id, title, icon, order_index FROM rule_subcategories 
            ORDER BY order_index ASC
        `)

        return NextResponse.json({ 
            sections, 
            rules, 
            subcategories 
        })
    } catch (error) {
        console.error('Error fetching public rules:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 