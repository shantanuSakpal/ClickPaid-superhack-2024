"use client";
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';

const chains = [
  { name: 'OP Mainnet', image: '/img/1.jpeg', votes: 120 },
  { name: 'Base', image: '/img/2.jpeg', votes: 80 },
  { name: 'Mode', image: '/img/3.jpeg', votes: 50 },
  { name: 'WorldCoin', image: '/img/4.jpeg', votes: 150 },
];

const totalVotes = chains.reduce((acc, chain) => acc + chain.votes, 0);

const Layout = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (name) => {
    setSelectedOption(name);
  };

  const calculatePercentage = (votes) => {
    return ((votes / totalVotes) * 100).toFixed(2);
  };

  return (
    <div className="flex bg-white min-h-[100vh] px-10 text-black">
      <Toaster position="top-center" reverseOrder={true} />
      {/* Left side */}
      <div className="w-[70%] p-4 border-r border-gray-300">
        <div className="grid grid-cols-2 gap-4">
          {chains.map((chain, index) => (
            <div
              key={index}
              className="relative w-full pt-[56.25%] bg-gray-300 border border-gray-300 rounded"
              style={{ opacity: 1 }} // No transparency for images
            >
              <img
                src={chain.image}
                alt={chain.name}
                className="absolute inset-0 w-full h-full object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right side */}
      <div className="w-[30%] p-4">
        <div className="p-4 bg-white border border-gray-300 rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4">Vote for your favorite:</h2>
          <div className="space-y-2">
            {chains.map((chain, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => handleOptionClick(chain.name)}
                  className={`relative block w-full py-2 px-4 rounded-md border border-gray-300 shadow-sm text-left focus:outline-none ${selectedOption === chain.name ? 'bg-gray-200' : 'bg-white'}`}
                >
                  <span>{chain.name}</span>
                  {selectedOption === chain.name && (
                    <>
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm">
                        {calculatePercentage(chain.votes)}%
                      </span>
                      <div
                        className="absolute inset-0 bg-gray-300"
                        style={{
                          width: `${calculatePercentage(chain.votes)}%`,
                          height: '4px',
                          bottom: 0,
                          left: 0,
                        }}
                      ></div>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
