import {NextResponse} from "next/server";
import {db} from '@/app/_lib/fireBaseConfig';
import {addDoc, collection, doc, getDoc, setDoc} from 'firebase/firestore';
import Web3 from 'web3';
import abi from "@/app/abis/abi"

const contractABI = abi; // Replace with your actual contract ABI
const contractAddress = '0x8C992ba2293dd69dB74bE621F61fF9E14E76F262'; // Replace with your deployed contract address
const privateKey = process.env.NEXT_PRIVATE_KEY; // Your private key stored in an environment variable


export async function POST(request) {
    if (!request) {
        return new NextResponse('No request object', {status: 400});
    }
    try {
        const {userId, optionId, postId, reward} = await request.json(); // Receive postId from JSON

        // Initialize Web3 instance
        const web3 = new Web3("https://opt-sepolia.g.alchemy.com/v2/5gfYGR46TZqdOnjEY-scgyCAwjWXeorz");

        // Create contract instance
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Function to send transaction with a specific private key
        async function sendTransaction(privateKey, fromAddress, toAddress, value, data) {
            const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest');
            const tx = {
                nonce: nonce,
                gasPrice: '20000000000',
                gasLimit: 30000,
                to: toAddress,
                value: web3.utils.toWei(value, 'ether'),
                data: data,
            };

            const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            return receipt;
        }

        // Call the vote function on the smart contract using the private key
        const fromAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;
        const voteData = contract.methods.vote(postId, userId, optionId).encodeABI();

        await sendTransaction(privateKey, fromAddress, contractAddress, '0', voteData);


        return new NextResponse('Vote submitted', {
            status: 200
        });

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

        //update the users tokens
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            return new NextResponse('User not found', {status: 404});
        }
        const user = userDocSnap.data();
        user.realTokenBalance += Number(reward);
        //add the post id to votes array in user
        user.votes.push(postId);
        await setDoc(userDocRef, user);


    } catch (error) {
        console.error("Error fetching post:", error);
        return new NextResponse('Failed to fetch post', {status: 500});
    }
}