"use client";
import {useRouter} from 'next/navigation';
import React, {useEffect, useState} from 'react';
import LoadingSpinner from "@components/LoadingSpinner";
import {signIn, useSession} from "next-auth/react";
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/20/solid";
import {GlobalContext} from "@/app/contexts/UserContext";
import {useContext} from "react";
import SwitchChains from "@components/SwitchChains";
import {useActiveAccount} from "thirdweb/react";
import ConnectWallet from "@components/ConnectWallet";

export default function Home() {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const {data: session} = useSession();
    const [loading, setLoading] = useState(false);
    const {selectedChain, setSelectedChain} = useContext(GlobalContext);
    const activeAccount = useActiveAccount();
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/getPosts', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    userId: session.user.id,
                    selectedChainId: selectedChain.id,
                }), // Send body as JSON
            });
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
    const [loggingIn, setLoggingIn] = useState(false);

    /*
    {
        "id": "cvmJepDi6GvAAGIn8Hpd",
        "options": [
            {
                "id": "dvkg2zz",
                "votes": 3,
                "imageUrl": "https://firebasestorage.googleapis.com/v0/b/clickpaid-suprhacks.appspot.com/o/images%2Fclickpaid_logo.png?alt=media&token=3eba1045-b8f9-4b81-8939-7f58baac3b33"
            },
            {
                "votes": 2,
                "id": "1knprhq",
                "imageUrl": "https://firebasestorage.googleapis.com/v0/b/clickpaid-suprhacks.appspot.com/o/images%2Fpexels-bertellifotografia-25078481.jpg?alt=media&token=09e0d215-b973-4ec5-b544-f2f3928ae0c2"
            }
        ],
        "description": "",
        "numberOfVotes": "10",
        "userId": "0x176b5380f242c71d6a7b76a22424e6234b889b7d261fad92ebad57323b37a766",
        "isDone": false,
        "title": "new post",
        "bountyReward": "100"
    }
     */

    useEffect(() => {
        if (session && selectedChain) {
            fetchPosts();
        }
    }, [session, selectedChain]);

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

            {
                activeAccount ? (<div className="flex flex-row gap-2 items-center mx-10 w-full justify-center">
                    <img src={selectedChain.image} alt={selectedChain.name}
                         className="w-7 h-7 rounded-full"/>
                    <span className="whitespace-nowrap font-semibold">{selectedChain.name}</span>
                    <SwitchChains/>
                </div>) : (
                    <div className="w-full flex justify-center">
                        <ConnectWallet title="Connect wallet to start voting!"/>
                    </div>
                )
            }

            <main className="">
                {/* Left Sidebar for Trending Section */}
                {/*<aside className="w-1/5 bg-white p-4 rounded shadow">*/}
                {/*    <h2 className="font-bold mb-4">Trending</h2>*/}
                {/*    /!* Content goes here *!/*/}
                {/*</aside>*/}

                {/* Center Section for Scrolling Posts */}
                {
                    !session && (
                        <button
                            onClick={() => {
                                setLoggingIn(true);
                                signIn("worldcoin")
                            }}
                            disabled={loggingIn}
                            className="w-fit mt-5 mx-auto bg-theme-blue-light hover:bg-theme-blue   font-bold text-xl  rounded-full py-2 px-5 flex flex-row items-center justify-center text-white">
                            <svg version="1.1" id="katman_1" xmlns="http://www.w3.org/2000/svg"
                                 x="0px" y="0px"
                                 viewBox="0 0 445.2 315.2"
                                 fill="white"
                                 className="h-10 w-auto"
                            >
                                <path className="st0" d="M327.6,115.2c-3-7.5-6.8-14.6-11.3-21.3c-20.3-30-54.7-49.7-93.6-49.7c-62.4,0-112.9,50.6-112.9,112.9
	c0,62.4,50.6,113,112.9,113c39,0,73.3-19.7,93.6-49.7c4.5-6.6,8.2-13.7,11.3-21.2c5.2-13,8.1-27.2,8.1-42
	C335.6,142.4,332.8,128.2,327.6,115.2z M312.5,145.7H183.2c2-7,5.7-13.2,10.7-18.1c7.6-7.6,18.1-12.3,29.7-12.3H303
	C307.9,124.6,311.1,134.8,312.5,145.7z M222.1,66.1c25.7,0,49,10.7,65.6,27.9h-61.3c-17.5,0-33.3,7.1-44.7,18.5
	c-8.9,8.9-15.1,20.3-17.4,33.2h-32.5C137.4,100.8,175.7,66.1,222.1,66.1z M222.1,248.4c-46.4,0-84.7-34.7-90.4-79.6h32.5
	c5.4,29.4,31.2,51.7,62.2,51.7h61.3C271.2,237.7,247.9,248.4,222.1,248.4z M223.6,199.3c-19.2,0-35.4-12.9-40.4-30.5h129.3
	c-1.4,10.9-4.7,21.1-9.5,30.5H223.6z"/>
                            </svg>

                            <span>{
                                loggingIn ? 'Logging in...' : 'Login to start voting!'
                            }</span>
                        </button>
                    )
                }
                {
                    loading ? (<LoadingSpinner/>) : (
                        posts && posts.length > 0 ? (
                            <div className="p-4">
                                {/* Display getPosts */}
                                {posts.map(post => (
                                    <div
                                        key={post.id}
                                        className="bg-white p-4 rounded border-1 mb-4 cursor-pointer hover:shadow-lg hover:shadow-gray-200n relative"
                                        onClick={() => handlePostClick(post.id)}
                                    >
                                        <div className="w-10 absolute right-5 h-auto rounded-full overflow-clip">
                                            <img src={post.selectedChain.image} alt=""/>
                                        </div>
                                        <h3 className="font-bold text-xl ">{post.title}</h3>
                                        <div className="mb-2">{post.description}</div>
                                        <div className="flex gap-2 mb-2 mt-5">
                                            {post.options.map((option, i) => (
                                                <div key={i}
                                                     className="relative w-72 h-auto bg-gray-300 border border-gray-300 rounded aspect-video">
                                                    <img src={option.imageUrl} alt="Option"
                                                         className="absolute inset-0 w-full h-full object-cover rounded"/>
                                                </div>
                                            ))}
                                        </div>
                                        <div>Bounty Reward: {post.bountyReward}</div>
                                        <div>Number of
                                            Votes: {post.options.reduce((acc, option) => acc + option.votes, 0)}/{post.numberOfVotes}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            session && (
                                <div className="w-full text-center mt-10 text-lg">No more posts on this chain, try switching network!</div>)
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
