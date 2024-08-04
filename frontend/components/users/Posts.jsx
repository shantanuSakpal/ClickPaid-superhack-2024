import React, { useState } from "react";
import { Button } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { ScrollShadow } from "@nextui-org/react";

// Define chain data
const chains = [
  { name: 'OP Sepolia', image: '/chain/optimism.jpeg' },
  { name: 'Base Sepolia', image: '/chain/base.jpeg' },
  { name: 'Mode TestNet', image: '/chain/mode.png' },
  { name: 'Metal L2', image: '/chain/metal-L2.png' },
  { name: 'World Coin', image: '/chain/worldcoin.png' },
];

// Define post data with hardcoded images
const posts = [
  {
    id: 1,
    title: "MrBeast Buys Everything In A Store!",
    description: "Watch as MrBeast goes on a shopping spree and buys everything in a store. You won't believe how much he spends! Read More ...",
    images: [
      "/img/1.jpeg",
      "/img/2.jpeg",
      "/img/3.jpeg",
      "/img/4.jpeg",
    ],
    chain: 'OP Sepolia'
  },
  {
    id: 2,
    title: "MrBeast Surprises Stranger With New Car",
    description: "In this video, MrBeast surprises a random stranger with a brand new car. The reaction is priceless. Read More ...",
    images: [
      "/img/1.jpeg",
      "/img/2.jpeg",
      "/img/3.jpeg",
      "/img/4.jpeg",
    ],
    chain: 'Base Sepolia'
  },
  {
    id: 3,
    title: "MrBeast's $100,000 Challenge!",
    description: "Join MrBeast as he hosts a $100,000 challenge with incredible twists and turns. Find out who wins! Read More ...",
    images: [
      "/img/1.jpeg",
      "/img/2.jpeg",
      "/img/3.jpeg",
      "/img/4.jpeg",
    ],
    chain: 'Mode TestNet'
  }
];

function Page() {
  const { data: session } = useSession();
  const [activeChain, setActiveChain] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);

  const handleChainFilter = (chain) => {
    setActiveChain(chain);
  };

  const handlePostClick = (id) => {
    setExpandedPostId(expandedPostId === id ? null : id);
  };

  const filteredPosts = activeChain ? posts.filter(post => post.chain === activeChain) : posts;

  return (
    <div className="flex flex-col h-screen overflow-y-auto">
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-gray-200 p-4">
          <div className="mb-4">
            {chains.map((chain, index) => (
              <Button
                key={index}
                onClick={() => handleChainFilter(chain.name)}
                className="w-full mb-2"
              >
                <img src={chain.image} alt={chain.name} className="w-6 h-6 rounded-full inline mr-2" />
                {chain.name}
              </Button>
            ))}
          </div>
          <Button onClick={() => handleChainFilter(null)} className="w-full">
            Show All
          </Button>
        </div>

        {/* Central Content */}
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
          <ScrollShadow hideScrollBar>
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white p-4 rounded shadow cursor-pointer"
                  onClick={() => handlePostClick(post.id)}
                >
                  <h3 className="font-bold mb-2">{post.title}</h3>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {post.images.map((image, i) => (
                      <div key={i} className="relative w-full pt-[56.25%] bg-gray-300 border border-gray-300 rounded">
                        <img src={image} alt={`Post ${post.id} Image ${i + 1}`} className="absolute inset-0 w-full h-full object-cover rounded" />
                      </div>
                    ))}
                  </div>
                  <div>
                    {expandedPostId === post.id ? post.description : post.description.length > 100 ? `${post.description.substring(0, 100)}...` : post.description}
                    {post.description.length > 100 && (
                      <button onClick={() => handlePostClick(post.id)} className="text-blue-500 mt-2 block">
                        {expandedPostId === post.id ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollShadow>
        </div>
      </div>
    </div>
  );
}

export default Page;
