import {db} from '@/app/_lib/fireBaseConfig';
import {doc, getDoc} from 'firebase/firestore';
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
        //get the user object from the database using userId
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            return new NextResponse('User not found', {status: 404});
        }
        userDocSnap.data();
        //get the token balance from the user object
        const tokenBalance = {
            realTokenBalance: userDocSnap.data().realTokenBalance,
            trialTokenBalance: userDocSnap.data().trialTokenBalance
        };
        return new NextResponse(JSON.stringify(tokenBalance), {status: 200});

    } catch (error) {
        console.error("Error fetching getPosts:", error);
        return new Response('Failed to fetch getPosts', {status: 500});
    }
}
