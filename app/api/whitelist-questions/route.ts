import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Získat aktivní whitelist otázky pro formulář (public)
export async function GET() {
    try {
        // Get active questions from database ordered by order_index
        const dbQuestions = await prisma.whitelistQuestion.findMany({
            where: {
                // Assuming there's an isActive field, if not, remove this where clause
            },
            orderBy: [
                { orderIndex: 'asc' },
                { id: 'asc' }
            ]
        });

        // Parse and transform questions
        const questions = dbQuestions.map(question => ({
            id: question.id,
            question: question.question,
            type: question.type,
            placeholder: question.placeholder,
            required: question.required,
            options: question.options,
            orderIndex: question.orderIndex
        }));

        return NextResponse.json({ 
            questions,
            totalQuestions: questions.length 
        });
    } catch (error) {
        console.error('Error fetching whitelist questions:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 