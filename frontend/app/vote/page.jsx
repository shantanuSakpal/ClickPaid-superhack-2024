"use client";
import Head from 'next/head';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import LoadingSpinner from "@components/LoadingSpinner";

const chains = [
    {name: 'OP Mainnet', image: '/img/1.jpeg'},
    {name: 'Base', image: '/img/2.jpeg'},
    {name: 'Mode', image: '/img/3.jpeg'},
    {name: 'WorldCoin', image: '/img/4.jpeg'},
];

export default function Home() {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/getPosts');
            if (!response.ok) {
                throw new Error('Failed to fetch getPosts');
            }
            const data = await response.json();
            console.log('Fetched getPosts:', data);
            setPosts(data);
        } catch (error) {
            console.error('Error fetching getPosts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchPosts();
    }, []);

    const handlePostClick = (postId) => {
        router.push(`/post/${postId}`);
    };

    return (
        <div className=" text-black min-h-screen">
            <div>
                <h1 className="text-3xl font-bold text-center mb-2">Cast Your Vote, Shape the Spotlight!</h1>
                <p className="text-lg text-center mb-5">
                    Select any post and vote with a simple click, get a share of the reward for the post.
                </p>
            </div>
            <main className="">
                {/* Left Sidebar for Trending Section */}
                {/*<aside className="w-1/5 bg-white p-4 rounded shadow">*/}
                {/*    <h2 className="font-bold mb-4">Trending</h2>*/}
                {/*    /!* Content goes here *!/*/}
                {/*</aside>*/}

                {/* Center Section for Scrolling Posts */}
                <h2 className="font-bold  text-2xl px-5">Recent posts</h2>

                {
                    loading ? (<LoadingSpinner/>) : (
                        posts && (
                            <div className="p-4">
                                {/* Display getPosts */}
                                {posts.map(post => (
                                    <div
                                        key={post.id}
                                        className="bg-white p-4 rounded border-1 mb-4 cursor-pointer hover:shadow-lg hover:shadow-gray-200"
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
                                        <div>Bounty Reward: {post.bountyReward}</div>
                                        <div>Number of Votes: {post.numberOfVotes}</div>
                                    </div>
                                ))}
                            </div>
                        )
                    )
                }

                {/* Right Sidebar for Suggestions */}
                {/*<aside className="w-1/4 bg-white p-4 rounded shadow">*/}
                {/*    <h2 className="font-bold mb-4">Suggestions</h2>*/}
                {/*    /!* Demo content *!/*/}
                {/*    {Array(5).fill(0).map((_, index) => (*/}
                {/*        <div key={index} className="bg-gray-200 p-2 rounded mb-2">*/}
                {/*            <div className="font-bold">User {index + 1}</div>*/}
                {/*            <div className="text-sm text-gray-600">Follow</div>*/}
                {/*        </div>*/}
                {/*    ))}*/}
                {/*</aside>*/}
            </main>
        </div>
    );
}
