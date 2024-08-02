import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const { message } = body;

        // Here you would typically do something with the message
        // For now, let's just echo it back

        return NextResponse.json({ success: true, message: `Received: ${message}` }, { status: 200 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}