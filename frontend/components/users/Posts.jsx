import React, { useState } from "react";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@components/LoadingSpinner";
import Link from "next/link";
import usePostsWithCache from "@components/customHooks/userPostsWithCache";

function Page() {
  const { data: session } = useSession();
  const [expandedPostId, setExpandedPostId] = useState(null);
  const { posts, loading, error } = usePostsWithCache(session?.user?.id);

  const handlePostClick = (id) => {
    setExpandedPostId(expandedPostId === id ? null : id);
  };

  return (
      <div className="flex flex-col h-screen overflow-y-auto">
        <div className="text-lg font-bold">Your posts</div>
        {loading ? (
            <LoadingSpinner />
        ) : error ? (
            <div className="text-red-500">{error}</div>
        ) : posts && posts.length > 0 ? (
            <div className="p-4">
              {posts.map((post) => (
                  <div
                      key={post.id}
                      className="bg-white p-4 rounded border-1 mb-4 cursor-pointer hover:shadow-lg hover:shadow-gray-200"
                      onClick={() => handlePostClick(post.id)}
                  >
                    <h3 className="font-bold text-xl mb-2">{post.title}</h3>
                    <div className="flex gap-2 mb-2">
                      {post.options.map((option, i) => (
                          <div
                              key={i}
                              className="relative w-72 h-auto bg-gray-300 border border-gray-300 rounded aspect-video"
                          >
                            <img
                                src={option.imageUrl}
                                alt="Option"
                                className="absolute inset-0 w-full h-full object-cover rounded"
                            />
                          </div>
                      ))}
                    </div>
                    <div>{post.description}</div>
                    <div>Bounty Reward: {post.bountyReward}</div>
                    <div>
                      Number of Votes:{" "}
                      {post.options.reduce((acc, option) => acc + option.votes, 0)}/
                      {post.numberOfVotes}
                    </div>
                  </div>
              ))}
            </div>
        ) : (
            <div className="w-full text-center mt-10 text-lg">
              No posts created.
              <Link href="/create" className="ml-2 text-blue-500 hover:underline">
                Create now!
              </Link>
            </div>
        )}
      </div>
  );
}

export default Page;