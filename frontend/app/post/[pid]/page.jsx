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

  //get post id from url http://localhost:3000/post/3A3xlC2vxbc0mEnNLSGU

  return (
    <div className="flex min-h-[100vh] px-10 text-black">



    </div>
  );
};

export default Layout;
