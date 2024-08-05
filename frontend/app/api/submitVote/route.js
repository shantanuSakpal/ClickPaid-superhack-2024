import {NextResponse} from "next/server";
import {db} from '@/app/_lib/fireBaseConfig';
import {addDoc, collection, doc, getDoc, setDoc} from 'firebase/firestore';

export async function POST(request) {
    if (!request) {
        return new NextResponse('No request object', {status: 400});
    }
    try {
        const {userId, optionId, postId, reward} = await request.json(); // Receive postId from JSON
        //find the post and update the votes
        const postDocRef = doc(db, 'posts', postId);
        const postDocSnap = await getDoc(postDocRef);
        if (!postDocSnap.exists()) {
            return new NextResponse('Post not found', {status: 404});
        }
        const post = postDocSnap.data();
        if(post.userId === userId){
            return new NextResponse('Cannot vote on own post', {status: 403});
        }
        const option = post.options.find(o => o.id === optionId);
        if (!option) {
            return new NextResponse('Option not found', {status: 404});
        }
        option.votes += 1;
        //if total votes = number of votes, set isDone to true
        if (post.options.reduce((acc, o) => acc + o.votes, 0) === post.numberOfVotes) {
            post.isDone = true;
        }
        //set the new options array
        await setDoc(postDocRef, post);

        //add the vote to the votes collection
        await addDoc(collection(db, 'votes'), {
            userId,
            optionId,
            postId,
            reward
        });

        //update the users tokens
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            return new NextResponse('User not found', {status: 404});
        }
        const user = userDocSnap.data();
        user.realTokenBalance += Number(reward);
        //add the post id to votes array in user
        user.votes.push(postId);
        await setDoc(userDocRef, user);

        return new NextResponse('Vote submitted', {
            status: 200
        });
    } catch (error) {
        console.error("Error fetching post:", error);
        return new NextResponse('Failed to fetch post', {status: 500});
    }
}