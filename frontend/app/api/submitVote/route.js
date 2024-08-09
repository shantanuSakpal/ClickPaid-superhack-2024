import { NextResponse } from "next/server";
import { db } from '@/app/_lib/fireBaseConfig';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import Web3 from 'web3';
import abi from "@/app/abis/abi.json";

// Define contract addresses for different chains
const contractAddresses = {
    'op-sepolia': '0x8C992ba2293dd69dB74bE621F61fF9E14E76F262',
    'base-sepolia': '0x26ed997929235be85c7a2d54ae7c60d91e443ea1',
    'metal-l2': '0x821ec6aeef9da466eac1f297d29d81251f50c50f',
    'mode-testnet': '0x821EC6AeEf9DA466eac1f297D29d81251F50C50F',
};

// Define web3 provider URLs for different chains
const providerUrls = {
    'op-sepolia': 'https://optimism-sepolia.infura.io/v3/b725fe7c53164e5da34a10cc350877c4',
    'base-sepolia': 'https://base-sepolia.g.alchemy.com/v2/5gfYGR46TZqdOnjEY-scgyCAwjWXeorz',
    'metal-l2': 'https://testnet.rpc.metall2.com',
    'mode-testnet': 'https://sepolia.mode.network',
};

// Function to get the web3 instance based on the chain
const getWeb3Instance = (chain) => {
    const providerUrl = providerUrls[chain];
    return new Web3(new Web3.providers.HttpProvider(providerUrl));
};

// Function to get the contract instance based on the chain
const getContractInstance = (chain) => {
    const contractAddress = contractAddresses[chain];
    const web3 = getWeb3Instance(chain);
    return new web3.eth.Contract(abi, contractAddress);
};

// Function to sign and send a transaction to the blockchain
const addVoteToBlockchain = async (chain, postId, userId, optionId, privateKey) => {
    const web3 = getWeb3Instance(chain); // Get the web3 instance for the specified chain
    const fromAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    const contract = getContractInstance(chain);

    const transactionObject = {
        from: fromAddress,
        to: contract.options.address,
        data: contract.methods.vote(postId, userId, optionId).encodeABI(),
        gas: 2000000,
        maxFeePerGas: web3.utils.toWei('50', 'gwei'),
        maxPriorityFeePerGas: web3.utils.toWei('10', 'gwei'),
    };

    const signedTx = await web3.eth.accounts.signTransaction(transactionObject, privateKey);
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return txReceipt;
};

export async function POST(request) {
    if (!request) {
        return new NextResponse('No request object', { status: 400 });
    }
    
    try {
        const { userId, optionId, postId, reward, chain } = await request.json();

        if (!userId || !optionId || !postId || !reward || !chain) {
            console.error("Missing required parameters:", { userId, optionId, postId, reward, chain });
            return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
        }

        const privateKey = process.env.NEXT_PRIVATE_KEY;
        if (!privateKey) {
            console.error("Private key is missing.");
            return new Response(JSON.stringify({ error: 'Private key is not configured' }), { status: 500 });
        }

        // Call the function to add the vote to the blockchain
        const txReceipt = await addVoteToBlockchain(chain, postId, userId, optionId, privateKey);
        console.log('Transaction receipt:', txReceipt);

        // Continue with Firestore operations
        const postDocRef = doc(db, 'posts', postId);
        const postDocSnap = await getDoc(postDocRef);
        if (!postDocSnap.exists()) {
            return new NextResponse('Post not found', {status: 404});
        }
        const post = postDocSnap.data();
        if (post.userId === userId) {
            return new NextResponse('Cannot vote on own post', {status: 403});
        }
        const option = post.options.find(o => o.id === optionId);
        if (!option) {
            return new NextResponse('Option not found', {status: 404});
        }
        option.votes += 1;
        //if total votes = number of votes, set isDone to true
        if (post.options.reduce((acc, o) => acc + o.votes, 0) === post.numberOfVotes) {
            post.isDone = true;
        }
        //set the new options array
        await setDoc(postDocRef, post);

        //add the vote to the votes collection
        await addDoc(collection(db, 'votes'), {
            userId,
            optionId,
            postId,
            reward
        });

        //update the users rewards
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            return new NextResponse('User not found', {status: 404});
        }
        const user = userDocSnap.data();
        //add the post id to votes array in user
        user.rewards = Number(user.rewards) + Number(reward);
        console.log(user.rewards)

        user.votes.push(postId);
        await setDoc(userDocRef, user);

        return new NextResponse('Vote submitted', {
            status: 200
        });


    } catch (error) {
        console.error("Error fetching post:", error);
        return new NextResponse('Failed to fetch post', {status: 500});
    }
}