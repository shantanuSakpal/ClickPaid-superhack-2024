"use client";
import React, {useEffect, useState} from 'react';
import {toast} from 'react-hot-toast';
import {uploadImage} from '@/app/_utils/uploadImages';
import {updateDoc, arrayUnion, doc, getDoc, setDoc} from 'firebase/firestore';
import Image from "next/image";
import {FaCloudUploadAlt} from "react-icons/fa";
import {useSession, signIn} from "next-auth/react"
import {GlobalContext} from "@/app/contexts/UserContext";
import {useContext} from "react";
import SwitchChains from "@components/SwitchChains";
import {useActiveWallet, useSendTransaction, useWaitForReceipt} from "thirdweb/react";
import {db} from '@/app/_lib/fireBaseConfig';
import ConnectWallet from "@components/ConnectWallet";
import {client} from "@/app/_lib/client";
import {ethers} from 'ethers';
import {base, ethereum, sepolia, baseSepolia, optimismSepolia} from "thirdweb/chains";
import {defineChain, getContract, prepareContractCall, prepareTransaction} from "thirdweb";
import {toWei} from "thirdweb/utils"
import {PriceServiceConnection} from "@pythnetwork/price-service-client";


require('dotenv').config();

function Page() {
    const {userData, setUserData, selectedChain, setSelectedChain} = useContext(GlobalContext);
    const activeWallet = useActiveWallet();
    const {mutateAsync: sendTx, data: transactionResult} = useSendTransaction();
    const {data: session} = useSession()
    const [txHash, setTxHash] = useState("");
    const [currChain, setCurrChain] = useState(optimismSepolia);
    const {data: receipt, isLoading} = useWaitForReceipt({
        chain: currChain,
        client: client,
        transactionHash: txHash
    });
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        bountyReward: '',
        numberOfVotes: '',
    });
    const [loading, setLoading] = useState(false);
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);

    const [images, setImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]); // Store file references
    const [aiGeneratedImage, setAiGeneratedImage] = useState(null);
    const [generatingImage, setGeneratingImage] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false)
    const [userAddress, setUserAddress] = useState('');
    const [amtInEth, setAmtInEth] = useState(0);
    const [verfyingTxn, setVerifyingTxn] = useState(false);
    const [postId, setPostId] = useState("");
    const [postData, setPostData] = useState(null);
    const [gettingLiveEthPrice, setGettingLiveEthPrice] = useState(false);
    const [txnVerified, setTxnVerified] = useState(false);
    const [awatingConfirmation, setAwaitingConfirmation] = useState(false);
    const [gettingAiImages, setGettingAiImages] = useState(false)
    const [prevAiGenImgs, setPrevAiGenImgs] = useState([])
    const [idsArray, setIdsArray] = useState([])

    const contractAddresses = {
        "base-sepolia": "0x26ed997929235be85c7a2d54ae7c60d91e443ea1",
        "op-sepolia": "0x9620e836108aFE5F15c6Fba231DCCDb7853c5480",
        "mode-testnet": "0x9B8B3AC576cDF17F9076be43Ae665Ed3864eFF0d",
        "metal-l2": "0x996A200B7cEa5a00EAB75072Ddf172F3C38b21a7",
    }

    //custom chains
    const metalL2Testnet = defineChain({
        id: 1740,
        name: "Metal L2 Testnet",
        nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18},
        blockExplorers: [
            {
                name: "Blockscout",
                url: "https://testnet.explorer.metall2.com"
            }
        ],
        testnet: true
    });

    const modeTestnet = defineChain({
        id: 919,
        name: "Mode Testnet",
        nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18},
        blockExplorers: [
            {
                name: "Blockscout",
                url: "https://sepolia.explorer.mode.network/"
            }
        ],
        testnet: true
    });

    const chainNameToChain = {
        "base-sepolia": baseSepolia,
        "op-sepolia": optimismSepolia,
        "mode-testnet": modeTestnet,
        "metal-l2": metalL2Testnet,
    }

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

    const base64ToBlob = (base64string) => {
        const bytes = atob(base64string.split(',')[1]);
        const array = [];
        for (let i = 0; i < bytes.length; i++) {
            array.push(bytes.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: 'image/png'});
    };

    const addAIgeneratedImageToImageArray = (base64string) => {
        // console.log("base 64 string", base64string)
        const blob = base64ToBlob(base64string);
        const file = new File([blob], 'image.png', {type: 'image/png'});
        setImageFiles((prevFiles) => [...prevFiles, file]);
        //scroll to top smoothly
        window.scrollTo({top: 0, behavior: 'smooth'});
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

    const generateUniqueIds = (length) => {
        let ids_array = [];
        for (let i = 0; i < length; i++) {
            let id = Math.random().toString(36).substring(2, 9);
            // Ensure the ID is unique within the array
            while (ids_array.includes(id)) {
                id = Math.random().toString(36).substring(2, 9);
            }
            ids_array.push(id);
        }
        return ids_array;
    };

    const uploadImages = async (idsArray) => {
        // idsArray is like = ["id1", "id2", ...]
        setUploadingImages(true);
        const uploadedImages = [];

        for (let i = 0; i < idsArray.length; i++) {
            const id = idsArray[i];
            const file = imageFiles[i]; // Assuming imageFiles is an array of files

            let url;

            // Check if the file is already a Firebase URL
            if (typeof file === 'string') {
                url = file;
            } else {
                // If not a Firebase URL, upload the file
                url = await uploadImage(file);
                if (!url) {
                    uploadedImages.push(null); // Push null if upload fails
                    continue;
                }
            }

            uploadedImages.push({
                id,
                imageUrl: url,
                votes: 0,
            });
        }

        // Don't forget to set uploadingImages to false when done
        setUploadingImages(false);

        return uploadedImages;
    }

    const convertUsdToWei = async (usdAmount) => {
        if (!usdAmount || isNaN(usdAmount) || usdAmount <= 0) {
            console.log("Invalid amount");
            return;
        }

        const connection = new PriceServiceConnection("https://hermes.pyth.network");

        try {
            setGettingLiveEthPrice(true)
            // Fetch the latest ETH price
            const priceId = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"; // ETH/USD price id
            const currentPrices = await connection.getLatestPriceFeeds([priceId]);
            const ethPriceData = currentPrices[0].price;

            // Extract the price value and convert to float
            const ethPrice = parseFloat(ethPriceData.price) / 1e8; // Convert from integer to float

            // Calculate the equivalent amount in ETH
            let eth_amt = Number(usdAmount) / ethPrice;
            eth_amt = eth_amt.toFixed(6); // Round to 6 decimal places

            // Convert ETH to Wei
            setAmtInEth(eth_amt);
            return eth_amt.toString(); // Return Wei as a string
        } catch (error) {
            console.error("Error fetching ETH price or converting:", error);
            throw new Error("Failed to convert USD to Wei");
        } finally {
            setGettingLiveEthPrice(false);
        }
    };

    const addDataToBlockchain = async () => {
        // Validate the form inputs
        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            setVerifyingTxn(true);

            //make optionId array using the length of imageFiles to be uploaded
            const optionIds = generateUniqueIds(imageFiles.length);
            setIdsArray(optionIds)


            //post id is random 6 digit string alphanumeric
            const post_id = Math.random().toString(36).substring(2, 8);
            setPostId(post_id);
            // Save post data to Firebase
            const post_data = {
                ...formState,
                selectedChain: selectedChain,
                selectedChainId: selectedChain.id,
                userId: userData.id,
                options: optionIds,
                isDone: false,
                id: post_id,
                date: new Date().toISOString(),
            };
            // console.log("postData", post_data)
            setPostData(post_data);
            // Add data to blockchain

            const {bountyReward, userId, options, numberOfVotes} = post_data;
            const bountyRewardinEther = await convertUsdToWei(bountyReward);
            // console.log("bountyRewardinEther", bountyRewardinEther)
            //get chain using the selected chain name from chains

            const address = contractAddresses[selectedChain.id];
            const contract = getContract({
                address: address, // Replace with your contract address
                chain: currChain,
                client,
            });

            const transaction = prepareContractCall({
                contract,
                value: ethers.parseEther(bountyRewardinEther.toString()),
                method: "function createPost(string memory postId, uint256 bounty, uint256 numVoters, string memory userId, string[] memory optionIDs)",
                params: [
                    post_id,
                    ethers.parseEther(bountyRewardinEther.toString()), // Convert bountyReward to Wei
                    numberOfVotes,
                    userId,
                    options
                ]
            });

            // Send the transaction
            const tx = await sendTx(transaction);
            // console.log("tx---------------------", tx)
            setTxHash(tx.transactionHash);
            setAwaitingConfirmation(true);
            setCurrChain(tx.chain)

        } catch (error) {
            console.error('Detailed error:', error);
            toast.error(`Contract interaction failed: ${error.message}`);
        } finally {
            setVerifyingTxn(false);

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
            const newImageBase64String = `data:image/png;base64,${data.imageData}`;

            // console.log("generated image base64 string", newImageBase64String)
            const blob = base64ToBlob(newImageBase64String);
            const file = new File([blob], 'image.png', {type: 'image/png'});
            // Update state with the new image
            setAiGeneratedImage(newImageBase64String);

            // Save the image to Firebase
            const imageRef = await uploadImage(file);
            if (!imageRef) {
                throw new Error('Failed to save image');
            }
            // console.log("image ref", imageRef)

            const userRef = doc(db, 'users', userData.id);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                toast.error("User not found")
                return;
            }
            const userDoc = userSnap.data();

            // Update user document with generated image url
            await updateDoc(userRef, {
                aiGeneratedImages: arrayUnion(imageRef)
            });

            setPrevAiGenImgs((prev) => [...prev, imageRef]);

        } catch (error) {
            console.error('Error generating image:', error);
            toast.error('Failed to generate image, maybe out of credits :(');
        } finally {
            setGeneratingImage(false);
        }
    };

    const fetchPreviousAIimages = async (userId) => {
        console.log("fetching ai images...")
        try {
            setGettingAiImages(true);
            const userRef = doc(db, 'users', userData.id);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                toast.error("User not found")
                return;
            }
            const userDoc = userSnap.data();
            const imgArr = userDoc.aiGeneratedImages;
            setPrevAiGenImgs(imgArr);
            // console.log("prev images", imgArr)
        } catch (error) {
            console.error('Error getting image:', error);
            toast.error('Failed to get previous images');
        } finally {
            setGettingAiImages(false);
        }
    }

    const handleAddImageToUploads = (imgUrl) => {
        // console.log("images added", imgUrl)
        setImageFiles((prev) => [...prev, imgUrl])
        //scroll to top smoothly
        window.scrollTo({top: 0, behavior: 'smooth'});

    }

    const handleSubmit = async () => {
        if (!postData || !postId || !idsArray) {
            toast.error("Could not save post.");
            return;
        }
        try {

            // Upload images to Firebase and get URLs
            const uploadedImages = await uploadImages(idsArray);

            if (uploadedImages.length === 0) {
                toast.error("Could not upload images");
                setLoading(false);
                return;
            }

            setLoading(true);
            // Check user before proceeding
            const userRef = doc(db, "users", userData.id);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {

                toast.error("User not found")
                setLoading(false);
                return;

            }
            const userDoc = userSnap.data();
            // // Check if the document already exists
            const docRef = doc(db, 'posts', postId);
            const docSnap = await getDoc(docRef);

            const updatedPostData = {
                ...postData,
                options: uploadedImages,
            };

            if (!docSnap.exists()) {
                // Document doesn't exist, so create it
                await setDoc(docRef, updatedPostData, {merge: false});
                console.log("New post created with ID: ", postId);
            } else {
                // Document already exists
                console.log("A post with this ID already exists. Generating a new ID...");
                throw new Error("Post ID already exists");
            }
            // Update user document with new post ID and token balances
            await setDoc(userRef, {
                posts: [...userDoc.posts, postId],
            }, {merge: true});

            toast.success("Post published successfully!");
            setTxnVerified(false);
            setTxHash(null)
            // Reset form state
            setFormState({
                title: '',
                description: '',
                bountyReward: '5',
                numberOfVotes: '',
                selectedChain: selectedChain,
            });
            setImageFiles([]);
            setIdsArray([])
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
                    {
                        typeof imageFiles[i] === 'string' ? (
                            <Image src={imageFiles[i]} alt={`uploaded-${i}`}
                                   className="absolute inset-0 w-full h-full object-cover rounded"
                                   width={300} height={300}
                            />
                        ) : (<Image src={URL.createObjectURL(imageFiles[i])} alt={`uploaded-${i}`}
                                    className="absolute inset-0 w-full h-full object-cover rounded"
                                    width={300} height={300}
                        />)
                    }
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
        if (selectedChain) {
            setCurrChain(chainNameToChain[selectedChain.id])
            console.log("selectedChain", selectedChain)
        }

    }, [selectedChain]);

    useEffect(() => {
        if (receipt && txHash) {
            console.log("Transaction confirmed");
            // Handle successful transaction confirmation
            if (receipt.status === 'success') {
                setTxnVerified(true);
                toast.success("Transaction confirmed!");
                handleSubmit();
            } else {
                toast.error("Transaction failed");
            }
            setAwaitingConfirmation(false);
        }
    }, [receipt])

    useEffect(() => {
        if (userData) {
            fetchPreviousAIimages(userData.id);
        }
    }, [userData]);

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
                            <div className='w-1/2 '>
                                <label htmlFor="bountyReward"
                                       className="block text-sm font-medium text-gray-700">Reward</label>
                                <div className="flex items-center flex-row mr-5 gap-1 mt-1">
                                    <input
                                        type="number"
                                        id="bountyReward"
                                        name="bountyReward"
                                        value={formState.bountyReward}
                                        onChange={handleChange}
                                        onBlur={() => convertUsdToWei(formState.bountyReward)}
                                        className=" block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        placeholder="Enter reward in USD"
                                    />
                                    <div className="text-sm font-bold">USD</div>
                                </div>
                            </div>
                            <div className='w-1/2'>
                                <label htmlFor="numberOfVotes" className="block text-sm font-medium text-gray-700">Equivalent
                                    ETH Amount</label>

                                <div className="flex items-center flex-row mr-5 gap-1 mt-1">
                                    <div
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm  sm:text-sm">
                                        {
                                            amtInEth ? amtInEth : "0"
                                        }
                                    </div>
                                    <div className="text-sm font-bold">ETH</div>
                                </div>
                            </div>
                        </div>

                        <div className='flex space-x-2'>

                            <div className='w-full'>
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
                        {
                            activeWallet && (
                                <div className="flex flex-col">
                                    <label className="block text-sm font-medium text-gray-700">Posting on</label>
                                    <div className="flex flex-row gap-5 justify-between items-center mt-2">
                                        {
                                            selectedChain && <div className="flex flex-row gap-2 items-center">
                                                <img src={selectedChain.image} alt={selectedChain.name}
                                                     className="w-7 h-7 rounded-full"/>
                                                <span className="whitespace-nowrap font-semibold">{selectedChain.name}</span>
                                            </div>
                                        }
                                        <div>
                                            <SwitchChains/>
                                        </div>
                                    </div>

                                </div>
                            )
                        }
                        {


                            activeWallet ? (session ? (

                                txnVerified ? (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className={`w-full mt-4  font-semibold py-2 rounded-md  ${loading || uploadingImages ? "bg-gray-300 text-black cursor-not-allowed" : "bg-theme-blue-light text-white hover:bg-theme-blue"}`}
                                        disabled={loading}
                                    >
                                        {
                                            uploadingImages && "Uploading images..."
                                        }
                                        {
                                            loading && "Publishing post..."
                                        }
                                        {
                                            !uploadingImages && !loading && "Publish post"
                                        }
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={addDataToBlockchain}
                                        className={`w-full mt-4  font-semibold py-2 rounded-md  ${verfyingTxn || awatingConfirmation ? "bg-gray-300 text-black cursor-not-allowed" : "bg-theme-blue-light text-white hover:bg-theme-blue"}`}
                                        disabled={verfyingTxn || awatingConfirmation}
                                    >
                                        {
                                            verfyingTxn ? "Initiating transaction..." : ""
                                        }
                                        {
                                            awatingConfirmation ? "Awaiting confirmation..." : ""
                                        }
                                        {
                                            !verfyingTxn && !awatingConfirmation ? `Pay ${formState.bountyReward} USD` : ""
                                        }
                                    </button>
                                )

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
                            )) : (
                                <ConnectWallet title="Connect Wallet to Publish Post"/>
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
                    <div className="flex  px-10 ">
                        {/* images container */}
                        <div className="w-7/12 p-4 ">
                            {aiGeneratedImage ? (
                                <div className="grid grid-cols-1 gap-4">
                                    <div
                                        className="relative w-full pt-[56.25%] bg-gray-300  rounded hover:cursor-pointer border-4 border-transparent hover:border-theme-blue-light"
                                        onClick={() => addAIgeneratedImageToImageArray(aiGeneratedImage)}
                                    >

                                        <Image
                                            src={aiGeneratedImage}
                                            alt={`AI Generated Thumbnail`}
                                            className="absolute inset-0 w-full h-full object-cover rounded"
                                            width={1024}
                                            height={576}
                                        />
                                    </div>
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
                                    className={`w-full mt-4 text-white font-semibold py-2 rounded-md  ${generatingImage ? "bg-gray-300 text-black cursor-not-allowed" : "bg-theme-blue-light"}`}
                                    disabled={generatingImage}
                                >
                                    {generatingImage ? "Generating Image..." : "Generate New Thumbnail"}
                                </button>
                                <div className="font-bold text-center ">Click on generated thumbnails to add them to
                                    uploads
                                </div>

                            </form>

                        </div>


                    </div>
                    {
                        userData && (<div className="p-10 my-3">
                            <h3 className="text-xl font-bold">{
                                gettingAiImages ? "Fetching previous images..." : "Previously created images (click on any image to add to uploads)"
                            }</h3>
                            <div className="flex gap-3 w-full flex-wrap my-5">
                                {
                                    prevAiGenImgs && prevAiGenImgs.length > 0 ? (
                                        prevAiGenImgs.map((imgUrl, ind) => {
                                            return (
                                                <div key={ind} className="rounded overflow-clip"
                                                     onClick={() => {
                                                         handleAddImageToUploads(imgUrl)
                                                     }}>
                                                    <Image src={imgUrl} alt="ai image" width={1024} height={720}
                                                           className=" h-48 w-auto"/>
                                                </div>)

                                        })
                                    ) : (
                                        <div className="text-center">No images found!</div>
                                    )
                                }
                            </div>
                        </div>)
                    }
                </div>
            </div>

        </div>
    );
};

export default Page;
