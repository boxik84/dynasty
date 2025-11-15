import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { randomUUID } from 'crypto';

const FIVEMANAGE_API_KEY = process.env.FIVEMANAGE_API_KEY;
const FIVEMANAGE_UPLOAD_URL = 'https://api.fivemanage.com/v1/files/upload';

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!FIVEMANAGE_API_KEY) {
        console.error('FIVEMANAGE_API_KEY is not configured.');
        return new NextResponse('Internal Server Error: File upload service is not configured.', { status: 500 });
    }

    try {
        const { contentType } = await req.json();

        if (!contentType || !contentType.startsWith('image/')) {
            return new NextResponse('Invalid content type. Only images are allowed.', { status: 400 });
        }
        
        // Vygenerujeme unikátní název souboru, abychom předešli konfliktům
        const fileExtension = contentType.split('/')[1];
        const fileName = `${randomUUID()}.${fileExtension}`;

        // Pošleme požadavek na Fivemanage API pro získání presigned URL
        const response = await fetch(FIVEMANAGE_UPLOAD_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FIVEMANAGE_API_KEY}`,
            },
            body: JSON.stringify({
                path: `fotosoutez/${fileName}`, // Cesta, kam se soubor na Fivemanage uloží
                contentType: contentType,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Error getting presigned URL from Fivemanage:', errorData);
            return new NextResponse('Failed to prepare file upload.', { status: 500 });
        }

        const presignedData = await response.json();

        return NextResponse.json(presignedData);

    } catch (error) {
        console.error('Error preparing file upload:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 