"use client";
import React, { useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Toaster, toast } from 'react-hot-toast';

const chains = [
  { name: 'OP Mainet', image: '/chain/optimism.jpeg' },
  { name: 'Base', image: '/chain/base.jpeg' },
  { name: 'Mode', image: '/chain/mode.png' },
  { name: 'WorldCoin', image: '/chain/worldcoin.png' },
];

const Layout = () => {
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    selectedChain: chains[0],
    bountyReward: '',
    numberOfVotes: '',
    nftPrice: '',
  });

  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prevImages => [...prevImages, ...newImages].slice(0, 4)); // Append new images and ensure the total count doesn't exceed 4
  };

  const handleImageRemove = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  const validateForm = () => {
    const { title, description, bountyReward, numberOfVotes, nftPrice } = formState;
    if (!title || !description || !bountyReward || !numberOfVotes || !nftPrice) {
      toast.error("All fields are required");
      return false;
    }
    if (isNaN(bountyReward)) {
      toast.error("Bounty Reward must be a numbers");
      return false;
    }
    if (isNaN(numberOfVotes)) {
      toast.error("Votes must be a number");
      return false;
    }
    if (isNaN(nftPrice)) {
      toast.error("NFT Price must be a numbers");
      return false;
    }

    if(bountyReward <= 0 || numberOfVotes <= 0 || nftPrice <= 0){
      toast.error("Values must be greater than 0");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    toast.promise(
      saveSettings(formState), // You need to define saveSettings function
      {
        loading: 'Saving...',
        success: <b>Settings saved!</b>,
        error: <b>Could not save.</b>,
      }
    );
  };

  const renderDivs = () => {
    const divs = [];

    // Add existing images
    for (let i = 0; i < images.length; i++) {
      divs.push(
        <div key={i} className="relative w-full pt-[56.25%] bg-gray-300 border border-gray-300 rounded">
          <img src={images[i]} alt={`uploaded-${i}`} className="absolute inset-0 w-full h-full object-cover rounded" />
          <button
            onClick={() => handleImageRemove(i)}
            className="absolute top-2 right-2 bg-white bg-opacity-50 rounded-full p-1"
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      );
    }

    // Add blank upload div
    if (images.length < 4) {
      divs.push(
        <div key={images.length} className="relative w-full pt-[56.25%] bg-gray-300 border border-gray-300 rounded">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>
      );
    }

    return divs;
  };

  return (
    <div className="flex bg-white min-h-[100vh] px-10 text-black">
      <Toaster position="top-center" reverseOrder={true} />
      {/* Left side */}
      <div className="w-7/12 p-4 border-r border-gray-300">
        <div className={`grid gap-4 ${images.length === 0 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {renderDivs()}
        </div>
      </div>

      {/* Right side */}
      <div className="w-5/12 p-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Post Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formState.title}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              placeholder="Enter post title"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Post Description</label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              placeholder="Enter post description"
            ></textarea>
          </div>
          <div className='flex space-x-2'>
            <div className='w-1/2'>
              <label htmlFor="bountyReward" className="block text-sm font-medium text-gray-700">Bounty Reward</label>
              <input
                type="text"
                id="bountyReward"
                name="bountyReward"
                value={formState.bountyReward}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Enter bounty reward"
              />
            </div>
            <div className='w-1/2'>
              <label htmlFor="numberOfVotes" className="block text-sm font-medium text-gray-700">Number of Votes</label>
              <input
                type="text"
                id="numberOfVotes"
                name="numberOfVotes"
                value={formState.numberOfVotes}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Enter number of votes"
              />
            </div>
          </div>
          <div className='flex space-x-2'>
            <div className='w-1/2'>
              <label htmlFor="nftPrice" className="block text-sm font-medium text-gray-700">NFT Price</label>
              <input
                type="text"
                id="nftPrice"
                name="nftPrice"
                value={formState.nftPrice}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Enter NFT price"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Chain</label>
              <Menu as="div" className="relative inline-block text-left w-full">
                <div>
                  <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    <img src={formState.selectedChain.image} alt={formState.selectedChain.name} className="w-5 h-5 rounded-full mr-2" />
                    {formState.selectedChain.name}
                    <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
                  </MenuButton>
                </div>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <div className="py-1">
                    {chains.map((chain) => (
                      <MenuItem key={chain.name}>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={() => setFormState({ ...formState, selectedChain: chain })}
                            className={`block w-full px-4 py-2 text-left text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                          >
                            <img src={chain.image} alt={chain.name} className="w-5 h-5 rounded-full mr-2 inline" />
                            {chain.name}
                          </button>
                        )}
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Menu>
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default Layout;
