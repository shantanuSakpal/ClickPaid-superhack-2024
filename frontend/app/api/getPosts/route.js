import {db} from '@/app/_lib/fireBaseConfig';
import {collection, doc, getDoc, getDocs} from 'firebase/firestore';
import {NextResponse} from "next/server";

export async function POST(request) {
    if (!request) {
        return new NextResponse('No request object', {status: 400});
    }
    const {userId} = await request.json(); // Receive postId from JSON
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
        const user = userDocSnap.data();

        //filter all the posts in which user has already voted
        const userVotes = user.votes;
        const filteredPosts = posts.filter(post => !userVotes.includes(post.id));
        return new NextResponse(JSON.stringify(filteredPosts), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
        });

    } catch (error) {
        console.error("Error fetching getPosts:", error);
        return new Response('Failed to fetch getPosts', {status: 500});
    }
}
