import { NextResponse } from "next/server";import { NextResponse } f        if (!request) {

import prisma from "@/lib/prisma";            return NextResponse.json({

import { auth } from "@/lib/auth";                hasRequest: false,

import { headers } from "next/headers";                status: null,

                message: "Žádná whitelist žádost nenalezena"

// GET - Získat status whitelist žádosti aktuálního uživatele            });

export async function GET() {        }

    try {

        const session = await auth.api.getSession({        return NextResponse.json({

            headers: await headers(),            hasRequest: true,

        });            status: request.status,

            requestId: request.id,

        if (!session) {            createdAt: request.createdAt,

            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });            updatedAt: request.updatedAt,

        }            message: getStatusMessage(request.status)

        });

        // Najít nejnovější žádost uživateleimport prisma from "@/lib/prisma";

        const request = await prisma.whitelistRequest.findFirst({import { auth } from "@/lib/auth";

            where: {import { headers } from "next/headers";

                userId: session.user.id

            },// GET - Získat status whitelist žádosti aktuálního uživatele

            orderBy: {export async function GET() {

                createdAt: 'desc'    try {

            },        const session = await auth.api.getSession({

            select: {            headers: await headers(),

                id: true,        });

                status: true,

                createdAt: true,        if (!session) {

                updatedAt: true            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

            }        }

        });

        // Najít nejnovější žádost uživatele

        if (!request) {        const request = await prisma.whitelistRequest.findFirst({

            return NextResponse.json({            where: {

                hasRequest: false,                userId: session.user.id

                status: null,            },

                message: "Žádná whitelist žádost nenalezena"            orderBy: {

            });                createdAt: 'desc'

        }            },

            select: {

        return NextResponse.json({                id: true,

            hasRequest: true,                status: true,

            status: request.status,                createdAt: true,

            requestId: request.id,                updatedAt: true

            createdAt: request.createdAt,            }

            updatedAt: request.updatedAt,        });

            message: getStatusMessage(request.status)

        });        if (!request) {

    } catch (error) {            return NextResponse.json({

        console.error("Error fetching whitelist status:", error);                hasRequest: false,

        return NextResponse.json(                status: null,

            { error: "Internal server error" },                message: "Žádná whitelist žádost nenalezena"

            { status: 500 }            });

        );        }

    }

}        const request = rows[0] as any;



function getStatusMessage(status: string): string {        return NextResponse.json({

    switch (status) {            hasRequest: true,

        case 'pending':            status: request.status,

            return 'Žádost čeká se na vyhodnocení';            requestId: request.id,

        case 'approved':            createdAt: request.created_at,

            return 'Schválená žádost';            updatedAt: request.updated_at,

        case 'rejected':            message: getStatusMessage(request.status)

            return 'Zamítnutá žádost';        });

        default:    } catch (error) {

            return 'Neznámý status žádosti';        console.error("Error fetching whitelist status:", error);

    }        return NextResponse.json(

}            { error: "Internal server error" },

            { status: 500 }
        );
    }
}

function getStatusMessage(status: string): string {
    switch (status) {
        case 'pending':
            return 'Žádost čeká se na vyhodnocení';
        case 'approved':
            return 'Schválená žádost';
        case 'rejected':
            return 'Zamítnutá žádost';
        default:
            return 'Neznámý status žádosti';
    }
}