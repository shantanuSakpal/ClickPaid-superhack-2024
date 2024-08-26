"use client";
import React, {useState, useEffect} from 'react';
import {toast, Toaster} from 'react-hot-toast';
import Image from "next/image";
import LoadingSpinner from "@components/LoadingSpinner";
import {useSession, signIn} from "next-auth/react";
import {useRouter} from "next/navigation";
import {GlobalContext} from "@/app/contexts/UserContext";
import {useContext} from "react";



const Layout = () => {
    const {data: session} = useSession()
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isOwner, setIsOwner] = useState(false)
    const navigate = useRouter();
    const { userData, setUserData } = useContext(GlobalContext);
    const [reward, setReward] = useState("");

    /*
    post = {
        "id": "3A3xlC2vxbc0mEnNLSGU",
        "description": "",
        "options": [
            {
                "id": "wlkdwzy",
                "imageUrl": "",
                "votes": 0
            }
        ],
        "isDone": false,
        "numberOfVotes": "100",
        "title": "asdfasdf",
        "userId": "",
        "bountyReward": "100"
    }
     */

    const fetchPost = async () => {
        setLoading(true);
        const postId = window.location.pathname.split('/').pop();
        if (!postId) {
            toast.error("Post not found");
            return;
        }

        try {
            // console.log("post id", postId)
            const response = await fetch(`/api/getPost`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({postId}), // Send postId as JSON
            });
            const data = await response.json();
            //check if curr user is post owner
                // console.log(data.userId, userData.id)
            if (data.userId === userData.id) {
                setIsOwner(true);
            }
            setPost(data);
            let share = (Number(data.bountyReward) /Number(data.numberOfVotes)).toFixed(2);
            setReward(share);
            // console.log("data", data);
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false)
        }
    }


    const handleSubmitVote = async (e) => {
        e.preventDefault(); // Add this line

        const postId = window.location.pathname.split('/').pop();

        if (!selectedOptionId) {
            toast.error("Please select an option");
            return;
        }
        if (!session) {
            toast.error("Please login to submit vote")
            return;
        }
        // console.log("selectedOptionId", selectedOptionId);
        try {
            setSubmitting(true);
            const body = {
                userId: userData.id,
                postId: postId,
                optionId: selectedOptionId,
                reward: reward,
            }
            const response = await fetch(`/api/submitVote`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body), // Send body as JSON
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                console.error('Error submitting vote:', errorMessage);
                toast.error(errorMessage); // Display the error message to the user
            } else {
                const responseData = await response.json(); // Parse JSON response
                let newReward = responseData.balance; // Extract balance
                setUserData({...userData, balance: newReward}); // Update userData state
                toast.success("Vote submitted");
                navigate.push('/vote');
            }

        } catch (error) {
            console.error('Error submitting vote:', error);
            toast.error("Something went wrong :(");

        } finally {
            setSubmitting(false)

        }

    }

    useEffect(() => {
        if(userData){
            fetchPost();
        }
    }, [userData]);

    return (
        <div className="min-h-screen text-black">
            {loading ? (
                <LoadingSpinner/>
            ) : (post && (
                <div className="p-5">
                    <div className="relative">
                        <h2 className="text-3xl  font-bold">{post.title}</h2>
                        <div className="">Reward: {reward} tokens</div>
                    </div>
                    <p className="text-lg">{post.description}</p>
                    <div className="grid grid-cols-2 gap-8 my-5">
                        {post.options.map((option, i) => (
                            <div key={i}
                                 className={`flex flex-col border-2 items-center  justify-center hover:cursor-pointer  rounded hover:shadow-lg hover:shadow-gray-400 p-2 ${selectedOptionId === option.id ? 'border-theme-blue-light shadow-lg shadow-gray-400' : 'border-gray-200'}`}
                                 onClick={() => setSelectedOptionId(option.id)}
                            >
                                <img src={option?.imageUrl} alt="Option"
                                     width={150} height={150}
                                     className="w-full h-52 mb-3 object-contain rounded"/>
                                <div>Option {i + 1}</div>
                                {
                                    isOwner && <div>{option.votes} votes</div>

                                }
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-5 mt-5">
                        {
                            !isOwner && (
                                <button
                                    disabled={loading}
                                    onClick={(e) => {
                                        if (session) {
                                            handleSubmitVote(e)
                                        } else {
                                            signIn("worldcoin")
                                        }
                                    }} // Pass event object here
                                    className={`bg-theme-blue-light hover:bg-theme-blue text-white px-5 py-2 rounded-md mt-5  ${submitting ? "bg-gray-300 text-black cursor-not-allowed" : "bg-theme-blue-light text-white hover:bg-theme-blue"}`}>
                                    {
                                        session ? (submitting ? 'Submitting...' : 'Submit') : "Login to vote"
                                    }
                                </button>)
                        }
                    </div>
                </div>
            ))

            }
        </div>
    );
};

export default Layout;