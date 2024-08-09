import {NextResponse} from "next/server";
import {db} from '@/app/_lib/fireBaseConfig';
import {addDoc, collection, doc, getDoc, setDoc} from 'firebase/firestore';
import Web3 from 'web3';
import abi from "@/app/abis/abi"

const contractABI = abi; // Replace with your actual contract ABI
const contractAddress = '0x8C992ba2293dd69dB74bE621F61fF9E14E76F262'; // Replace with your deployed contract address

const web3 = new Web3(new Web3.providers.HttpProvider(`https://optimism-sepolia.infura.io/v3/b725fe7c53164e5da34a10cc350877c4`));

// Configure the contract
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Middleware to sign transactions
const signTransaction = async (transactionObject, privateKey) => {
    const signedTx = await web3.eth.accounts.signTransaction(transactionObject, privateKey);
    return signedTx.rawTransaction;
};

export async function POST(request) {
    if (!request) {
        return new NextResponse('No request object', {status: 400});
    }
    try {
        const {userId, optionId, postId, reward} = await request.json(); // Receive postId from JSON

        if (!userId || !optionId || !postId || !reward) {
            console.error("Missing required parameters:", { userId, optionId, postId, reward });
            return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
        }
        //vote on blockchain
        // const privateKey = process.env.NEXT_PRIVATE_KEY;
        // if (!privateKey) {
        //     console.error("Private key is missing.");
        //     return new Response(JSON.stringify({ error: 'Private key is not configured' }), { status: 500 });
        // }
        //
        // // Get the from address from the private key
        // const fromAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;
        //
        // // Create transaction object
        // const transactionObject = {
        //     from: fromAddress, // Add the from address here
        //     to: contractAddress,
        //     data: contract.methods.vote(postId, userId, optionId).encodeABI(),
        //     gas: 2000000, // Specify the gas limit
        //     maxFeePerGas: web3.utils.toWei('50', 'gwei'), // Maximum total fee per gas
        //     maxPriorityFeePerGas: web3.utils.toWei('10', 'gwei'), // Priority fee per gas
        // };
        //
        // // Sign and send the transaction
        // const rawTx = await signTransaction(transactionObject, privateKey);
        // const txReceipt = await web3.eth.sendSignedTransaction(rawTx);

        //find the post and update the votes
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