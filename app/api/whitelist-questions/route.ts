import { NextResponse } from "next/server";
import { webDb } from "@/lib/db";

// GET - Získat aktivní whitelist otázky pro formulář (public)
export async function GET() {
    try {
        const db = webDb as any;

        const rows = await db
            .selectFrom("whitelist_questions")
            .select([
                "id",
                "question",
                "field_name",
                "field_type",
                "placeholder",
                "required",
                "category",
                "options",
                "min_value",
                "max_value",
                "min_length",
                "max_length",
                "order_index",
            ])
            .where("is_active", "=", 1)
            .orderBy("order_index", "asc")
            .orderBy("id", "asc")
            .execute();

        const questions = rows.map((row: any) => {
            const options = parseJsonArray(row.options);

            return {
                id: row.id,
                question: row.question,
                field_name: row.field_name,
                field_type: row.field_type,
                placeholder: row.placeholder ?? undefined,
                required: toBoolean(row.required),
                category: row.category ?? "general",
                options,
                min_value: row.min_value ?? undefined,
                max_value: row.max_value ?? undefined,
                min_length: row.min_length ?? undefined,
                max_length: row.max_length ?? undefined,
                order_index: Number(row.order_index ?? 0),
            };
        });

        const categories: Record<string, any[]> = {};
        for (const question of questions) {
            const key = question.category;
            if (!categories[key]) {
                categories[key] = [];
            }
            categories[key].push(question);
        }

        return NextResponse.json({
            questions,
            categories,
            totalQuestions: questions.length,
        });
    } catch (error) {
        console.error("Error fetching whitelist questions:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function parseJsonArray(value: unknown) {
    if (!value) {
        return undefined;
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : undefined;
        } catch (error) {
            console.warn("Failed to parse whitelist question options", error);
            return undefined;
        }
    }

    return undefined;
}

function toBoolean(value: unknown) {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        return value === 1;
    }

    return Boolean(value);
}