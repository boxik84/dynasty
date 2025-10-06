import { NextRequest, NextResponse } from 'next/server';
import databasefivem from '@/lib/db-fivem';
import { sendDiscordLog } from '@/lib/discord-log';

export async function DELETE(req: NextRequest, context: any) {
    const plate = (await context.params)?.plate;

    if (!plate) {
        await sendDiscordLog({
            title: 'API ERROR /api/vehicles/[plate] DELETE',
            description: 'Chybí SPZ v parametru.',
        });
        return NextResponse.json({ error: 'Chybí SPZ.', status: 400 });
    }

    try {
        const [result] = await databasefivem.execute(
            'DELETE FROM owned_vehicles WHERE plate = ?',
            [plate]
        );

        if (result && (result as any).affectedRows > 0) {
            await sendDiscordLog({
                title: 'API DELETE /api/vehicles/[plate]',
                description: `Vozidlo smazáno: ${plate}`,
            });
            return NextResponse.json({ success: true });
        } else {
            await sendDiscordLog({
                title: 'API ERROR /api/vehicles/[plate] DELETE',
                description: `Vozidlo nenalezeno: ${plate}`,
            });
            return NextResponse.json({ error: 'Vozidlo nenalezeno.' }, { status: 404 });
        }
    } catch (error) {
        await sendDiscordLog({
            title: 'API ERROR /api/vehicles/[plate] DELETE',
            description: 'Chyba při mazání vozidla.',
            fields: [
                { name: 'Error', value: String(error) }
            ]
        });
        return NextResponse.json({ error: 'Chyba serveru.' }, { status: 500 });
    }
}