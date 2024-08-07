"use client";
import React, {useEffect, useState} from 'react';
import {toast} from 'react-hot-toast';
import {uploadImage} from '@/app/_utils/uploadImages'; // Import uploadImage function
import {db} from '@/app/_lib/fireBaseConfig'; // Import db from firebaseConfig
import {collection, addDoc, doc, getDoc, setDoc} from 'firebase/firestore';
import Image from "next/image";
import {FaCloudUploadAlt} from "react-icons/fa";
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/20/solid";
import {useSession, signIn} from "next-auth/react"
import Web3 from 'web3';
import abi from "@/app/abis/abi";

require('dotenv').config();

function Page() {
    const chains = [
        {
            name: 'OP Sepolia',
            id: "op-sepolia",
            image: '/chain/optimism.jpeg',
            apiEndpoint: '/api/chain/op-sepolia/createPost'
        },
        {
            name: 'Base Sepolia',
            id: "base-sepolia",
            image: '/chain/base.jpeg',
            apiEndpoint: '/api/chain/base-sepolia/createPost'
        },
        {
            name: 'Mode TestNet',
            id: "mode-testnet",
            image: '/chain/mode.png',
            apiEndpoint: '/api/chain/mode-testnet/createPost'
        },
        {name: 'Metal L2', id: "metal-l2", image: '/chain/metal-L2.png', apiEndpoint: '/api/chain/metal-L2/createPost'},
    ];

    const [formState, setFormState] = useState({
        title: '',
        description: '',
        bountyReward: '',
        numberOfVotes: '',
        selectedChain: chains[0],
    });
    const [loading, setLoading] = useState(false);
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);

    // const activeAccount = useActiveAccount();
    const [images, setImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]); // Store file references
    const [aiGeneratedImages, setAiGeneratedImages] = useState([]);
    const [generatingImage, setGeneratingImage] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false)
    const {data: session} = useSession()
    const [userAddress, setUserAddress] = useState('');


    const handleChange = (e) => {
        const {name, value} = e.target;
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

    const addAIgeneratedImageToImageArray = (base64string) => {
        const blob = base64ToBlob(base64string);
        const file = new File([blob], 'image.png', { type: 'image/png' });
        setImageFiles((prevFiles) => [...prevFiles, file]);
        //scroll to top smoothly
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const base64ToBlob = (base64string) => {
        const bytes = atob(base64string.split(',')[1]);
        const array = [];
        for (let i = 0; i < bytes.length; i++) {
            array.push(bytes.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: 'image/png' });
    };

    const handleImageRemove = (index) => {
        const updatedFiles = [...imageFiles];
        updatedFiles.splice(index, 1);
        setImageFiles(updatedFiles);
    };

    const validateForm = () => {
        const {title, description, bountyReward, numberOfVotes, nftPrice} = formState;
        if (!title || !bountyReward || !numberOfVotes) {
            toast.error("All fields are required");
            return false;
        }

        if (Number(bountyReward) < 10) {
            toast.error("Reward should be at least 10 tokens");
            return false;
        }
        if (Number(numberOfVotes) < 10) {
            toast.error("Votes should be at least 10");
            return false;
        }

        // Check image size
        if (imageFiles.length > 0) {
            const maxSize = 5 * 1024 * 1024; // 5MB
            for (const file of imageFiles) {
                if (file.size > maxSize) {
                    toast.error("Image exceeds maximum size (5MB)");
                    return false;
                }
            }
        }

        if (imageFiles.length < 2) {
            toast.error("At least two images required");
            return false;
        }

        return true;
    };

    const uploadImages = async () => {
        setUploadingImages(true)
        const uploadedImages = await Promise.all(
            imageFiles.map(async (file) => {
                const url = await uploadImage(file);
                if (!url) return null;

                return {
                    id: Math.random().toString(36).substring(2, 9),
                    imageUrl: url,
                    votes: 0,
                };
            })
        );
        if (uploadedImages.some((image) => !image)) {
            setUploadingImages(false)
            return [];
        }
        // toast.success("Images Uploaded Successfully");
        setUploadingImages(false);
        return uploadedImages.filter((image) => image);
    };


    const addDataToBlockchain = async (postData, postId) => {
        if (!web3 || !contract) {
            toast.error("Web3 or contract not initialized");
            return;
        }

        try {
            // Connect to Web3
            if (typeof window.ethereum !== 'undefined') {
                const web3 = new Web3(window.ethereum);
                await window.ethereum.enable();

                // Get the current account
                const accounts = await web3.eth.getAccounts();
                const account = accounts[0];

                // Contract address and ABI (you need to replace these with your actual values)
                const contractAddress = '0x8C992ba2293dd69dB74bE621F61fF9E14E76F262';
                const contractABI = abi; // Add your contract ABI here

                // Create contract instance
                const contract = new web3.eth.Contract(contractABI, contractAddress);

                // Convert ETH to Wei

                const userId = session?.user.id;
                const bounty = postData.bountyReward;
                const numVoters = postData.numberOfVotes;
                const optionIDs = postData.options.map(option => option.id);

                // Then, create the post
                await contract.methods.createPost(postId, bounty, numVoters, userId, optionIDs).send({
                    from: account
                });

                console.log({postId, bounty, numVoters, userId, optionIDs})
                toast.success("lets go!!")
            } else {
                toast.error("bc")
            }
        } catch (error) {
            console.error('Detailed error:', error);
            toast.error(`Contract interaction failed: ${error.message}`);
        }
    };

    const handleGenerateImage = async (e) => {
        e.preventDefault();
        try {
            setGeneratingImage(true);
            const body = {
                topic: e.target.topic.value,
                text: e.target.text.value,
                description: e.target.description.value,
            }
            const response = await fetch(`/api/generateImageUsingAi`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({body}),
            });
            if (!response.ok) {
                throw new Error('Failed to generate image');
            }
            const data = await response.json();
            const newImage = `data:image/png;base64,${data.imageData}`;

            // Update state with the new image
            setAiGeneratedImages(prevImages => [...prevImages, newImage]);

            // Save the image to Firebase
            const imageRef = await uploadImage(newImage);
            if (!imageRef) {
                throw new Error('Failed to save image');
            }
            const userRef = doc(db, 'users', session.user.id);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                toast.error("User not found")
                return;
            }
            const userDoc = userSnap.data();
            // Update user document with generated image url
            await setDoc(userRef, {
                aiGeneratedImages: [...userDoc.aiGeneratedImages, imageRef],
            }, {merge: true});


        } catch (error) {
            console.error('Error generating image:', error);
            toast.error('Failed to generate image');
        } finally {
            setGeneratingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        // Validate the form inputs
        if (!validateForm()) {
            setLoading(false);
            return;
        }

        if (!session.user.id) {
            toast.error("Please login to create post");
            setLoading(false);
            return;
        }


        try {
            // Check balance before proceeding
            const userRef = doc(db, "users", session.user.id);
            const userSnap = await getDoc(userRef);
            let trialTokenBalance = 0;
            let realTokenBalance = 0;
            if (!userSnap.exists()) {

                toast.error("User not found")
                setLoading(false);
                return;


            }
            const userDoc = userSnap.data();
            realTokenBalance = userDoc.realTokenBalance;
            trialTokenBalance = userDoc.trialTokenBalance;
            if (trialTokenBalance > 0 || realTokenBalance > 0) {
                if (formState.bountyReward <= trialTokenBalance) {
                    //if user has trial tokens , deduct trial tokens
                    trialTokenBalance = trialTokenBalance - formState.bountyReward;
                } else {
                    let remainingAmt = formState.bountyReward - trialTokenBalance;
                    trialTokenBalance = 0;
                    if (realTokenBalance >= remainingAmt) {
                        realTokenBalance = realTokenBalance - remainingAmt
                    } else {
                        toast.error("Not enough balance!")
                        return;
                    }
                }
            } else {
                toast.error("Not enough balance!");
                return;
            }

            // Upload images to Firebase and get URLs
            const uploadedImages = await uploadImages();
            if (uploadedImages.length === 0) {
                toast.error("Could not upload images");
                setLoading(false);
                return;
            }

            // Save post data to Firebase
            const postData = {
                ...formState,
                userId: session.user.id,
                options: uploadedImages,
                isDone: false,
            };
            console.log("postData", postData)
            const docRef = await addDoc(collection(db, 'posts'), postData);

            // Update user document with new post ID and token balances
            await setDoc(userRef, {
                posts: [...userDoc.posts, docRef.id],
                realTokenBalance: realTokenBalance,
                trialTokenBalance: trialTokenBalance,
            }, {merge: true});

            const postId = docRef.id;

            toast.success("Post published successfully!");

            // Add data to blockchain
            await addDataToBlockchain(postData, postId);

            // Reset form state
            setFormState({
                title: '',
                description: '',
                bountyReward: '',
                numberOfVotes: '',
                selectedChain: chains[0],
            });
            setImageFiles([]);
        } catch (error) {
            console.error("Error handling submit:", error);
            toast.error("Could not save post.");
        } finally {
            setLoading(false)
        }

        setLoading(false);
    }


    const renderDivs = () => {
        const divs = [];

        // Add existing images
        for (let i = 0; i < imageFiles.length; i++) {
            divs.push(
                <div key={i} className="relative w-full pt-[56.25%] bg-gray-300 border border-gray-300 rounded">
                    <Image src={URL.createObjectURL(imageFiles[i])} alt={`uploaded-${i}`}
                           className="absolute inset-0 w-full h-full object-cover rounded"
                           width={300} height={300}
                    />
                    <button
                        onClick={() => handleImageRemove(i)}
                        className="absolute top-2 right-2 bg-white bg-opacity-50 rounded-full p-1"
                    >
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"></path>
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
                    <label
                        className="absolute top-1/2 flex flex-col text-black text-xl items-center ">
                        <div className="flex gap-2 items-center justify-center ">
                            Upload <FaCloudUploadAlt/>
                        </div>
                        <span className="text-sm">(Max 5 Mb)</span>
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


    useEffect(() => {

    }, []);
    return (
        <div className="w-full">
            <div className="py-2 mb-5">
                <h1 className="text-3xl text-center font-bold mb-2">
                    Create new post
                </h1>
                <p className="text-lg text-center">
                    Upload your images and let our community help you find the most attractive and clickable
                    thumbnail.
                </p>
            </div>

            <div className="flex  px-10 ">
                {/* Left side */}
                <div className="w-7/12 p-4 ">
                    <div className={`grid gap-4 ${imageFiles.length === 0 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {renderDivs()}
                    </div>
                </div>

                {/* Right side */}
                <div className="w-5/12 p-4">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Post
                                Title</label>
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
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Post
                                Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formState.description}
                                onChange={handleChange}
                                rows="4"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                placeholder="Tell people about this post (optional)"
                            ></textarea>
                        </div>
                        <div className='flex space-x-2'>
                            <div className='w-1/2'>
                                <label htmlFor="bountyReward"
                                       className="block text-sm font-medium text-gray-700">Reward</label>
                                <input
                                    type="number"
                                    id="bountyReward"
                                    name="bountyReward"
                                    value={formState.bountyReward}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    placeholder="Enter reward amount for this post"
                                />
                            </div>
                            <div className='w-1/2'>
                                <label htmlFor="numberOfVotes" className="block text-sm font-medium text-gray-700">Number
                                    of
                                    Votes</label>
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
                        {/*removing nft and chain selection for now*/}
                        <div className='flex space-x-2'>
                            {/*<div className='w-1/2'>*/}
                            {/*    <label htmlFor="nftPrice" className="block text-sm font-medium text-gray-700">NFT*/}
                            {/*        Price</label>*/}
                            {/*    <input*/}
                            {/*        type="number"*/}
                            {/*        id="nftPrice"*/}
                            {/*        name="nftPrice"*/}
                            {/*        value={formState.nftPrice}*/}
                            {/*        onChange={handleChange}*/}
                            {/*        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"*/}
                            {/*        placeholder="Enter NFT price"*/}
                            {/*    />*/}
                            {/*</div>*/}
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Chain</label>
                                <Menu as="div" className="relative inline-block text-left w-full">
                                    <div>
                                        <MenuButton
                                            className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                            <img src={formState.selectedChain.image} alt={formState.selectedChain.name}
                                                 className="w-5 h-5 rounded-full mr-2"/>
                                            {formState.selectedChain.name}
                                            <ChevronDownIcon aria-hidden="true"
                                                             className="-mr-1 h-5 w-5 text-gray-400"/>
                                        </MenuButton>
                                    </div>
                                    <MenuItems
                                        transition
                                        className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                    >
                                        <div className="py-1">
                                            {chains.map((chain) => (
                                                <MenuItem key={chain.name}>
                                                    {({active}) => (
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormState({
                                                                ...formState,
                                                                selectedChain: chain
                                                            })}
                                                            className={`block w-full px-4 py-2 text-left text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                                                        >
                                                            <img src={chain.image} alt={chain.name}
                                                                 className="w-5 h-5 rounded-full mr-2 inline"/>
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
                        {


                            session ? (
                                <button
                                    type="submit"
                                    className={`w-full mt-4  font-semibold py-2 rounded-md  ${loading ? "bg-gray-300 text-black cursor-not-allowed" : "bg-theme-blue-light text-white hover:bg-theme-blue"}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        uploadingImages ? "Uploading images..." : "Creating post..."
                                    ) : 'Publish Post'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="w-full mt-4 bg-theme-blue-light text-white font-semibold py-2 rounded-md hover:bg-theme-blue"
                                    onClick={() => {
                                        signIn("worldcoin")
                                    }}
                                >
                                    Login to Publish Post
                                </button>
                            )
                        }

                    </form>

                </div>
            </div>

            {/*AI image generation*/}
            <div className="flex flex-col w-full my-10">
                <div className="py-2 mb-5">
                    <h1 className="text-3xl text-center font-bold mb-2">
                        Generate thumbnails using AI
                    </h1>
                    <p className="text-center text-lg">Click on any image to add to uploads</p>
                    <div className="flex  px-10 ">
                        {/* images container */}
                        <div className="w-7/12 p-4 ">
                            {aiGeneratedImages.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {aiGeneratedImages.map((image, index) => (
                                        <div key={index}
                                             className="relative w-full pt-[56.25%] bg-gray-300  rounded hover:cursor-pointer border-4 border-transparent hover:border-theme-blue-light"
                                             onClick={() => addAIgeneratedImageToImageArray(image)}
                                        >

                                            <Image
                                                src={image}
                                                alt={`AI Generated Thumbnail ${index + 1}`}
                                                className="absolute inset-0 w-full h-full object-cover rounded"
                                                width={1024}
                                                height={576}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full flex justify-center items-center h-full bg-gray-300 rounded-lg">
                                    Your AI generated thumbnails will appear here
                                </div>
                            )}
                        </div>

                        {/* form */}
                        <div className="w-5/12 p-4">
                            <form className="space-y-4" onSubmit={handleGenerateImage}>
                                <div>
                                    <label htmlFor="title"
                                           className="block text-sm font-medium text-gray-700">Topic</label>
                                    <input
                                        type="text"
                                        id="topic"
                                        name="topic"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        placeholder="What is this thumbnail about?"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="title"
                                           className="block text-sm font-medium text-gray-700">Text</label>
                                    <input
                                        type="text"
                                        id="text"
                                        name="text"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        placeholder="Any text you want to add to the image?"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Thumbnail
                                        Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows="4"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        placeholder="Give a description about the thumbnail, the longer, the better!"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-4 bg-theme-blue-light text-white font-semibold py-2 rounded-md hover:bg-theme-blue"
                                    disabled={generatingImage}
                                >
                                    {generatingImage ? "Generating Image..." : "Generate New Thumbnail"}
                                </button>

                            </form>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Page;
