import { NextResponse } from "next/server";
import { db } from '@/app/_lib/fireBaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request) {
    if (!request) {
        return new NextResponse('No request object', { status: 400 });
    }
    try {
        const { postId } = await request.json(); // Receive postId from JSON
        console.log("post id", postId)
        const docRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const post = { id: docSnap.id, ...docSnap.data() };

            return new NextResponse(JSON.stringify(post), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            return new NextResponse('Post not found', { status: 404 });
        }
    } catch (error) {
        console.error("Error fetching post:", error);
        return new NextResponse('Failed to fetch post', { status: 500 });
    }
}