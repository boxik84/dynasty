import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import database from '@/lib/db'

// PUT - Upravit whitelist otázku (admin only)
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

        const { id: questionId } = await params
        const body = await req.json()
        const {
            question,
            field_name,
            field_type,
            placeholder,
            required,
            category,
            options,
            min_value,
            max_value,
            min_length,
            max_length,
            order_index,
            is_active
        } = body

        // Validate required fields
        if (!question || !field_name || !field_type) {
            return NextResponse.json({ error: 'Missing required fields: question, field_name, field_type' }, { status: 400 })
        }

        // Validate field_type
        const validFieldTypes = ['text', 'textarea', 'number', 'checkbox', 'url', 'select']
        if (!validFieldTypes.includes(field_type)) {
            return NextResponse.json({ error: 'Invalid field_type' }, { status: 400 })
        }

        // Check if field_name already exists for different question
        const [existingRows] = await database.execute(
            'SELECT id FROM whitelist_questions WHERE field_name = ? AND id != ?',
            [field_name, questionId]
        )

        if (Array.isArray(existingRows) && existingRows.length > 0) {
            return NextResponse.json({ error: 'Field name already exists' }, { status: 400 })
        }

        // Update question
        await database.execute(`
            UPDATE whitelist_questions SET 
                question = ?, field_name = ?, field_type = ?, placeholder = ?, 
                required = ?, category = ?, options = ?, min_value = ?, 
                max_value = ?, min_length = ?, max_length = ?, order_index = ?, 
                is_active = ?, updated_at = NOW()
            WHERE id = ?
        `, [
            question,
            field_name,
            field_type,
            placeholder || null,
            required !== undefined ? required : true,
            category || 'general',
            options ? JSON.stringify(options) : null,
            min_value || null,
            max_value || null,
            min_length || null,
            max_length || null,
            order_index || 0,
            is_active !== undefined ? is_active : true,
            questionId
        ])

        return NextResponse.json({ message: 'Question updated successfully' })
    } catch (error) {
        console.error('Error updating whitelist question:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Smazat whitelist otázku (admin only)
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

        const { id: questionId } = await params

        // Check if question exists
        const [rows] = await database.execute(
            'SELECT id, field_name FROM whitelist_questions WHERE id = ?',
            [questionId]
        )

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 })
        }

        const question = rows[0] as { field_name: string }

        // Prevent deletion of critical fields
        const criticalFields = ['discordName', 'age', 'rules']
        if (criticalFields.includes(question.field_name)) {
            return NextResponse.json({ 
                error: 'Cannot delete critical system fields (discordName, age, rules)' 
            }, { status: 400 })
        }

        // Delete question
        await database.execute(
            'DELETE FROM whitelist_questions WHERE id = ?',
            [questionId]
        )

        return NextResponse.json({ message: 'Question deleted successfully' })
    } catch (error) {
        console.error('Error deleting whitelist question:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 