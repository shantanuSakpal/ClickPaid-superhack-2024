"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { uploadImage } from '@/app/_utils/uploadImages'; // Import uploadImage function
import { db } from '@/app/_lib/fireBaseConfig'; // Import db from firebaseConfig
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import Image from "next/image";
import { FaCloudUploadAlt } from "react-icons/fa";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useSession, signIn } from "next-auth/react"
// import ConnectButtonComponent from '@/components/connectButtonComponent';
import { ThirdwebProvider, ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { createWallet, walletConnect, useActiveAccount} from "thirdweb/wallets";
// import { useAddress } from "@thirdweb-dev/react";

 


require('dotenv').config();


const client = createThirdwebClient({
    clientId: '',
    secretKey: ''
});


const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    walletConnect(),
    createWallet("com.trustwallet.app"),
    createWallet("io.zerion.wallet"),
    createWallet("me.rainbow"),
    createWallet("app.phantom"),
];


const chains = [
    { name: 'OP Sepolia', image: '/chain/optimism.jpeg', apiEndpoint: '/api/chain/op-sepolia/createPost' },
    { name: 'Base Sepolia', image: '/chain/base.jpeg', apiEndpoint: '/api/chain/base-sepolia/createPost' },
    { name: 'Mode TestNet', image: '/chain/mode.png', apiEndpoint: '/api/chain/mode-testnet/createPost' },
    { name: 'Metal L2', image: '/chain/metal-L2.png', apiEndpoint: '/api/chain/metal-L2/createPost' },
];

   function Page () {
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        bountyReward: '',
        numberOfVotes: '',
    });
    const activeAccount = useActiveAccount();
    const [images, setImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]); // Store file references
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false)
    const { data: session } = useSession()
    const [userAddress, setUserAddress] = useState('');
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState({
            ...formState,
            [name]: value,
        });
    };
    // const activeAccount = useActiveAccount(client);
    // console.log("activeAccount", activeAccount)

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 4) {
            toast.error("Maximum 4 images allowed");
            return;
        }

        setImageFiles(prevFiles => [...prevFiles, ...files].slice(0, 4)); // Append new files and ensure the total count doesn't exceed 4
    };

    const handleConnect = async (wallet) => {
        console.log("Connected wallet:", wallet);

        setUserAddress(address);
    };


    const handleImageRemove = (index) => {
        const updatedFiles = [...imageFiles];
        updatedFiles.splice(index, 1);
        setImageFiles(updatedFiles);
    };

    const validateForm = () => {
        const { title, description, bountyReward, numberOfVotes, nftPrice } = formState;
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

        if (imageFiles.length === 0) {
            toast.error("At least one image is required");
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

    const addDataToBlockchain = async (postData) => {
        // Prepare data for blockchain

        // const postID = docRef.id; // Assuming the document ID is used as postID
        // const {selectedChain, bountyReward} = formState;
        // const postDescription = formState.description;
        //
        // // Construct the API URL based on the selected chain
        // const apiUrl = selectedChain.apiEndpoint;
        // // Call the createPost API
        // const response = await fetch(apiUrl, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         postID,
        //         imageUrls: uploadedImages,
        //         descriptions: new Array(uploadedImages.length).fill(''), // Replace with actual descriptions if available
        //         postDescription,
        //         rewardAmount: bountyReward,
        //     }),
        // });
        //
        // const data = await response.json();
        // if (data.success) {
        //     toast.success("Post created on blockchain successfully!");
        // } else {
        //     toast.error("Failed to create post on blockchain.");
        // }

    }

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
            }, { merge: true });

            toast.success("Post published successfully!");

            // Add data to blockchain
            await addDataToBlockchain(postData);

            // Reset form state
            setFormState({
                title: '',
                description: '',
                bountyReward: '',
                numberOfVotes: '',
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
        ;

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
                            Upload <FaCloudUploadAlt />
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

            <div className="flex min-h-[100vh] px-10 ">
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
                        {/*<div className='flex space-x-2'>*/}
                        {/*    <div className='w-1/2'>*/}
                        {/*        <label htmlFor="nftPrice" className="block text-sm font-medium text-gray-700">NFT*/}
                        {/*            Price</label>*/}
                        {/*        <input*/}
                        {/*            type="number"*/}
                        {/*            id="nftPrice"*/}
                        {/*            name="nftPrice"*/}
                        {/*            value={formState.nftPrice}*/}
                        {/*            onChange={handleChange}*/}
                        {/*            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"*/}
                        {/*            placeholder="Enter NFT price"*/}
                        {/*        />*/}
                        {/*    </div>*/}
                        {/*    <div className="w-1/2">*/}
                        {/*        <label className="block text-sm font-medium text-gray-700 mb-1">Select Chain</label>*/}
                        {/*        <Menu as="div" className="relative inline-block text-left w-full">*/}
                        {/*            <div>*/}
                        {/*                <MenuButton*/}
                        {/*                    className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">*/}
                        {/*                    <img src={formState.selectedChain.image} alt={formState.selectedChain.name}*/}
                        {/*                         className="w-5 h-5 rounded-full mr-2"/>*/}
                        {/*                    {formState.selectedChain.name}*/}
                        {/*                    <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400"/>*/}
                        {/*                </MenuButton>*/}
                        {/*            </div>*/}
                        {/*            <MenuItems*/}
                        {/*                transition*/}
                        {/*                className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"*/}
                        {/*            >*/}
                        {/*                <div className="py-1">*/}
                        {/*                    {chains.map((chain) => (*/}
                        {/*                        <MenuItem key={chain.name}>*/}
                        {/*                            {({active}) => (*/}
                        {/*                                <button*/}
                        {/*                                    type="button"*/}
                        {/*                                    onClick={() => setFormState({*/}
                        {/*                                        ...formState,*/}
                        {/*                                        selectedChain: chain*/}
                        {/*                                    })}*/}
                        {/*                                    className={`block w-full px-4 py-2 text-left text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}*/}
                        {/*                                >*/}
                        {/*                                    <img src={chain.image} alt={chain.name}*/}
                        {/*                                         className="w-5 h-5 rounded-full mr-2 inline"/>*/}
                        {/*                                    {chain.name}*/}
                        {/*                                </button>*/}
                        {/*                            )}*/}
                        {/*                        </MenuItem>*/}
                        {/*                    ))}*/}
                        {/*                </div>*/}
                        {/*            </MenuItems>*/}
                        {/*        </Menu>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
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
                    <div className="mt-4">
                        <ConnectButton
                            client={client}
                            wallets={wallets}
                            theme={"dark"}
                            connectModal={{ size: "wide" }}


                        />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Page;
