import { NextResponse } from "next/server";

export async function POST(request) {
    try {

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        return new NextResponse('Failed to process withdrawal', { status: 500 });
    }
}