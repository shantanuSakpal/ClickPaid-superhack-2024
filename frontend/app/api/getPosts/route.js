import {db} from '@/app/_lib/fireBaseConfig';
import {collection, doc, getDoc, getDocs} from 'firebase/firestore';
import {NextResponse} from "next/server";



function sortAndSelectPosts(posts) {
    const numberOfPostsToSelect = posts.length > 20 ? 20 : posts.length;
    const currentDate = new Date();

    // Calculate scores for each post
    const scoredPosts = posts.map(post => {
        const postDate = new Date(post.date);
        const daysSinceCreation = (currentDate - postDate) / (1000 * 60 * 60 * 24);
        const bountyPerVote = post.bountyReward / (post.numberOfVotes || 1); // Prevent division by zero

        // Calculate score based on recency, bounty, and bounty per vote
        const score = (1 / (daysSinceCreation + 1)) *
            (parseFloat(post.bountyReward) * 2 + 1) *
            (bountyPerVote + 1);

        return { ...post, score };
    });

    // Normalize scores
    const scores = scoredPosts.map(post => post.score);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const normalizedScores = scoredPosts.map(post => ({
        ...post,
        normalizedScore: (post.score - minScore) / (maxScore - minScore) // Normalize scores to range [0, 1]
    }));

    // Sort posts by normalized score in descending order
    normalizedScores.sort((a, b) => b.normalizedScore - a.normalizedScore);

    // Select top 80% of posts based on normalized score
    const topPostsCount = Math.floor(numberOfPostsToSelect * 0.8);
    const topPosts = normalizedScores.slice(0, topPostsCount);

    // Randomly select remaining 20% from the bottom 50% of posts
    const bottomHalfPosts = normalizedScores.slice(Math.floor(normalizedScores.length / 2));
    const remainingPostsCount = numberOfPostsToSelect - topPostsCount;
    const randomBottomPosts = [];

    for (let i = 0; i < remainingPostsCount; i++) {
        if (bottomHalfPosts.length > 0) {
            const randomIndex = Math.floor(Math.random() * bottomHalfPosts.length);
            randomBottomPosts.push(bottomHalfPosts.splice(randomIndex, 1)[0]);
        }
    }

    // Combine the top posts and the randomly selected bottom posts
    const selectedPosts = [...topPosts, ...randomBottomPosts];

    // Return selected posts sorted by normalized score
    return selectedPosts.sort((a, b) => b.normalizedScore - a.normalizedScore);
}

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

        const userVotes = user.votes;

        //filter all the posts in which user has already voted
        let filteredPosts = posts.filter(post => !userVotes.includes(post.id));
        //also remove users post
        filteredPosts = filteredPosts.filter(post => post.userId !== userId);
        //remove post which are done
        filteredPosts = filteredPosts.filter(post => !post.done);
        // //sort by bountyReward
        // filteredPosts.sort((a, b) => b.bountyReward - a.bountyReward);
        // //sort by time of creation, date is like 2024-08-11T10:43:11.039Z
        // filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        // // //filter posts from selected chain
        // // filteredPosts = filteredPosts.filter(post => post.selectedChainId === selectedChainId);

        const selectedPosts = sortAndSelectPosts(filteredPosts);
        // console.log("filteredPosts--------------------", filteredPosts);
        //     console.log("selectedPosts-------------------------------", selectedPosts);
        return new NextResponse(JSON.stringify(selectedPosts), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
        });

    } catch (error) {
        console.error("Error fetching getPosts:", error);
        return new Response('Failed to fetch getPosts', {status: 500});
    }
}
