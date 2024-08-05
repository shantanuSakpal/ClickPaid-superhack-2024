import { db } from '../../_lib/fireBaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export async function POST({ request }) {
    try {
        const postId = await request.json();
        const docRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const post = { id: docSnap.id, ...docSnap.data() };
            return new Response(JSON.stringify(post), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            return new Response('Post not found', { status: 404 });
        }
    } catch (error) {
        console.error("Error fetching post:", error);
        return new Response('Failed to fetch post', { status: 500 });
    }
}