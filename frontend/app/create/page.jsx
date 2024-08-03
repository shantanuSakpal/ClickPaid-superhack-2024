"use client";
import React, { useState } from 'react';
import {  toast } from 'react-hot-toast';
import { uploadImage } from '../utils/uploadImages'; // Import uploadImage function
import { db } from '../lib/fireBaseConfig'; // Import db from firebaseConfig
import { collection, addDoc } from 'firebase/firestore';
import Image from "next/image";
import { FaCloudUploadAlt } from "react-icons/fa";

const chains = [
  { name: 'OP Sepolia', image: '/chain/optimism.jpeg' },
  { name: 'Base', image: '/chain/base.jpeg' },
  { name: 'Mode', image: '/chain/mode.png' },
  { name: 'WorldCoin', image: '/chain/worldcoin.png' },
];

const Page = () => {
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    selectedChain: chains[0],
    bountyReward: '',
    numberOfVotes: '',
    nftPrice: '',
  });

  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]); // Store file references
  const [loading, setLoading] = useState(false);

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

    setImageFiles(prevFiles => [...prevFiles, ...files].slice(0, 4)); // Append new files and ensure the total count doesn't exceed 4
  };

  const handleImageRemove = (index) => {
    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);
    setImageFiles(updatedFiles);
  };

  const validateForm = () => {
    const { title, description, bountyReward, numberOfVotes, nftPrice } = formState;
    if (!title || !description || !bountyReward || !numberOfVotes || !nftPrice) {
      toast.error("All fields are required");
      return false;
    }
    if (isNaN(bountyReward) || isNaN(numberOfVotes) || isNaN(nftPrice)) {
      toast.error("Bounty Reward, Votes, and NFT Price must be numbers");
      return false;
    }
    if (Number(bountyReward) <= 0 || Number(numberOfVotes) <= 0 || Number(nftPrice) <= 0) {
      toast.error("Values must be greater than 0");
      return false;
    }

    if(imageFiles.length === 0) {
        toast.error("At least one image is required");
        return false;
    }

    return true;
  };

  const uploadImages = async () => {
    const uploadedImages = await Promise.all(
      imageFiles.map(file => uploadImage(file))
    );
    //if failed to upload images, return
    if (uploadedImages.some(url => !url)) {
        return [];
    }
    toast.success("Images Uploaded Successfully");
    return uploadedImages.filter(url => url);

  };

  const saveSettings = async (uploadedImages) => {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...formState,
        images: uploadedImages,
      });
      toast.success("Post submitted successfully!");
      setFormState({
        title: '',
        description: '',
        selectedChain: chains[0],
        bountyReward: '',
        numberOfVotes: '',
        nftPrice: '',
      });
      setImageFiles([]);
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Could not save post.");
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (!validateForm()) {
        setLoading(false);
      return;
    }

    const uploadedImages = await uploadImages();
    if (uploadedImages.length === 0) {
      toast.error("Could not upload images");
        setLoading(false);
      return;
    }
    const saved = await saveSettings(uploadedImages);

    setLoading(false);

  };

  const renderDivs = () => {
    const divs = [];

    // Add existing images
    for (let i = 0; i < imageFiles.length; i++) {
      divs.push(
        <div key={i} className="relative w-full pt-[56.25%] bg-gray-300 border border-gray-300 rounded">
          <Image src={URL.createObjectURL(imageFiles[i])} alt={`uploaded-${i}`} className="absolute inset-0 w-full h-full object-cover rounded"
          width={300} height={300}
          />
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
    if (imageFiles.length < 4) {
      divs.push(
          <div key={imageFiles.length}
               className="relative flex items-center justify-center w-full pt-[56.25%] bg-gray-300 border border-gray-300 rounded">
            <label className="absolute top-1/2 flex flex-row text-xl items-center gap-2 ">Upload <FaCloudUploadAlt/>
            </label>
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
        {/* Left side */}
      <div className="w-7/12 p-4 border-r border-gray-300">
        <div className={`grid gap-4 ${imageFiles.length === 0 ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
                type="number"
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
                type="number"
                id="numberOfVotes"
                name="numberOfVotes"
                value={formState.numberOfVotes}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Enter number of votes"
              />
            </div>
          </div>
          <div>
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
          <button
            type="submit"
            className="w-full px-4 py-2 bg-black text-white font-medium rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
