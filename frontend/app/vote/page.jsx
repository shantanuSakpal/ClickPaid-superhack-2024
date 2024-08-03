"use client"
import Head from 'next/head';
import { useRouter } from 'next/navigation';

const chains = [
  { name: 'OP Mainnet', image: '/img/1.jpeg' },
  { name: 'Base', image: '/img/2.jpeg' },
  { name: 'Mode', image: '/img/3.jpeg' },
  { name: 'WorldCoin', image: '/img/4.jpeg' },
];

export default function Home() {
  const router = useRouter();

  const handlePostClick = (index) => {
    router.push(`/post/${index + 1}`);
  };

  return (
    <div className="bg-gray-50  text-black">

      <main className="container mx-auto flex justify-between mt-0 space-x-4">
        {/* Left Sidebar for Trending Section */}
        <aside className="w-1/5 bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-4">Trending</h2>
          {/* Content goes here */}
        </aside>

        {/* Center Section for Scrolling Posts */}
        <div className="flex-1 bg-gray-100 p-4 w-3/5 rounded shadow overflow-y-scroll h-screen">
          <h2 className="font-bold mb-4">Posts</h2>
          {/* Demo content */}
          {Array(10).fill(0).map((_, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded shadow mb-4 cursor-pointer"
              onClick={() => handlePostClick(index)}
            >
              <h3 className="font-bold mb-2">Post Title {index + 1}</h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {chains.map((chain, i) => (
                  <div key={i} className="relative w-full pt-[56.25%] bg-gray-300 border border-gray-300 rounded">
                    <img src={chain.image} alt={chain.name} className="absolute inset-0 w-full h-full object-cover rounded" />
                  </div>
                ))}
              </div>
              <div>Post content {index + 1}...</div>
            </div>
          ))}
        </div>

        {/* Right Sidebar for Suggestions */}
        <aside className="w-1/4 bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-4">Suggestions</h2>
          {/* Demo content */}
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="bg-gray-200 p-2 rounded mb-2">
              <div className="font-bold">User {index + 1}</div>
              <div className="text-sm text-gray-600">Follow</div>
            </div>
          ))}
        </aside>
      </main>
    </div>
  );
}
