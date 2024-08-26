import React, {useContext, useEffect, useState} from "react";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@components/LoadingSpinner";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {GlobalContext} from "@/app/contexts/UserContext";

function Page() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const {userData, setUserData} = useContext(GlobalContext);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/getPostsOfUser', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    userId: userData.id
                }), // Send body as JSON
            });
            if (!response.ok) {
                throw new Error('Failed to fetch getPosts');
            }
            const data = await response.json();
            // console.log('Fetched getPosts:', data);
            setPosts(data);
        } catch (error) {
            console.error('Error fetching getPosts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostClick = (postId) => {
        router.push(`/post/${postId}`);
    };


    useEffect(() => {
        if(session) {
            fetchPosts();
        }
    }, []);


    return (
        <div className="flex flex-col h-screen overflow-y-auto">
            {/* Main Content */}
            <div className="text-lg font-bold">Your posts</div>
            {
                loading ? (<LoadingSpinner/>) : (
                    posts && posts.length>0 ? (
                        <div className="p-4">
                            {/* Display getPosts */}
                            {posts.map(post => (
                                <div
                                    key={post.id}
                                    className="relative bg-white p-4 rounded border-1 mb-4 cursor-pointer hover:shadow-lg hover:shadow-gray-200"
                                    onClick={() => handlePostClick(post.id)}
                                >

                                    <h3 className="font-bold text-xl mb-2">{post.title}</h3>
                                    <div className="flex gap-2 mb-2">
                                        {post.options.map((option, i) => (
                                            <div key={i}
                                                 className="relative w-72 h-auto bg-gray-300 border border-gray-300 rounded aspect-video">
                                                <img src={option.imageUrl} alt="Option"
                                                     className="absolute inset-0 w-full h-full object-cover rounded"/>
                                            </div>
                                        ))}
                                    </div>
                                    <div>{post.description}</div>
                                    <div>Bounty Reward: {(post.bountyReward/post.numberOfVotes).toFixed(2)} tokens</div>
                                    <div>Number of
                                        Votes: {post.options.reduce((acc, option) => acc + option.votes, 0)}/{post.numberOfVotes}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full text-center mt-10 text-lg">No posts created.
                            <Link href="/create" className="text-theme-blue-light hover:text-theme-blue mx-3 ">Create
                                now!</Link>
                        </div>
                    )
                )
            }
        </div>
    );
}

export default Page;

