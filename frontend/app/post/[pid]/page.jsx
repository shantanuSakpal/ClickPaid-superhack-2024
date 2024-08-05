"use client";
import React, { useState, useEffect } from 'react';
import {toast, Toaster} from 'react-hot-toast';
import Image from "next/image";
import LoadingSpinner from "@components/LoadingSpinner";

const chains = [
  { name: 'OP Mainnet', image: '/img/1.jpeg', votes: 120 },
  { name: 'Base', image: '/img/2.jpeg', votes: 80 },
  { name: 'Mode', image: '/img/3.jpeg', votes: 50 },
  { name: 'WorldCoin', image: '/img/4.jpeg', votes: 150 },
];

const Layout = () => {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPost = async () => {
        setLoading(true);
    try {
      const postId = window.location.pathname.split('/').pop();
      console.log("post id", postId)
      const response = await fetch(`/api/getPost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }), // Send postId as JSON
      });
      const data = await response.json();
      setPost(data);
      console.log("data", data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitVote = async () => {
    console.log("selectedOptionId", selectedOptionId);
    if(!selectedOptionId) {
      toast.error("Please select an option");
      return;
    }
  }

  useEffect(() => {
    fetchPost();
  }, []);

  return (
      <div className="min-h-screen text-black">
        {loading ? (
            <LoadingSpinner/>
        ):( post && (
            <div className="p-5">
              <h2 className="text-3xl text-center font-bold">{post.title}</h2>
              <p className="text-lg">{post.description}</p>
              <div className="grid grid-cols-2 gap-8 my-5">
                {post.options.map((option, i) => (
                    <div key={i} className={`flex flex-col border-2 items-center gap-3 justify-center hover:cursor-pointer  rounded hover:shadow-lg hover:shadow-gray-400 p-2 ${selectedOptionId === option.id ? 'border-theme-blue-light shadow-lg shadow-gray-400' : 'border-gray-200'}`}
                    onClick={() => setSelectedOptionId(option.id)}
                    >
                      <img src={option?.imageUrl} alt="Option"
                             width={150} height={150}
                           className="w-full h-52  object-contain rounded"/>
                      <div>Option {i + 1}</div>
                    </div>
                ))}
              </div>
                <div className="flex justify-center gap-5 mt-5">
                    <button
                        onClick={handleSubmitVote}
                        className="bg-theme-blue-light hover:bg-theme-blue text-white px-5 py-2 rounded-md mt-5">Submit Vote</button>
                </div>
            </div>
        ))

        }
      </div>
  );
};

export default Layout;