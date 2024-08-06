import {db} from '@/app/_lib/fireBaseConfig';
import {collection, doc, getDoc, getDocs} from 'firebase/firestore';
import {NextResponse} from "next/server";

export async function POST(request) {
    if (!request) {
        return new NextResponse('No request object', {status: 400});
    }
    const {userId} = await request.json(); // Receive postId from JSON
    if(!userId) {
        return new NextResponse('No userId provided', {status: 400});
    }
    try {
        const querySnapshot = await getDocs(collection(db, 'posts'));
        const posts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        //get the user object from the database using userId
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            return new NextResponse('User not found', {status: 404});
        }
        userDocSnap.data();
//filter all the posts that have the same userId as the user
        const userPosts = posts.filter(post => post.userId === userId);
        return new NextResponse(JSON.stringify(userPosts), {status: 200});

    } catch (error) {
        console.error("Error fetching getPosts:", error);
        return new Response('Failed to fetch getPosts', {status: 500});
    }
}
