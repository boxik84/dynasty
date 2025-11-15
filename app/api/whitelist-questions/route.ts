import { NextResponse } from 'next/server'
import database from '@/lib/db'

// GET - Získat aktivní whitelist otázky pro formulář (public)
export async function GET() {
    try {
        // Get active questions from database ordered by category and order_index
        const [rows] = await database.execute(`
            SELECT 
                id, question, field_name, field_type, placeholder, 
                required, category, options, min_value, max_value, 
                min_length, max_length, order_index
            FROM whitelist_questions 
            WHERE is_active = TRUE
            ORDER BY order_index ASC, id ASC
        `)

        // Parse JSON options where needed
        const questions = (rows as any[]).map(question => ({
            ...question,
            options: question.options ? JSON.parse(question.options) : null,
            required: !!question.required
        }))

        // Group questions by category for easier frontend handling
        const categories = questions.reduce((acc, question) => {
            if (!acc[question.category]) {
                acc[question.category] = []
            }
            acc[question.category].push(question)
            return acc
        }, {} as Record<string, any[]>)

        return NextResponse.json({ 
            questions,
            categories,
            totalQuestions: questions.length 
        })
    } catch (error) {
        console.error('Error fetching whitelist questions:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 