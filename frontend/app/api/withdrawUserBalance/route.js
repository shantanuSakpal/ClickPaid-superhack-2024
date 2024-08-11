import { NextResponse } from "next/server";
import Web3 from 'web3';
import abi from "@/app/abis/abi";
; // Ensure this path is correct

// Define contract addresses and provider URLs for different chains
const contractAddresses = {
    "base-sepolia": "0x26ed997929235be85c7a2d54ae7c60d91e443ea1",
    "op-sepolia": "0x9620e836108aFE5F15c6Fba231DCCDb7853c5480",
    "mode-testnet": "0x9B8B3AC576cDF17F9076be43Ae665Ed3864eFF0d",
    "metal-l2": "0x996A200B7cEa5a00EAB75072Ddf172F3C38b21a7",
}

const providerUrls = {
    'op-sepolia': 'https://optimism-sepolia.infura.io/v3/b725fe7c53164e5da34a10cc350877c4',
    'base-sepolia': 'https://base-sepolia.g.alchemy.com/v2/5gfYGR46TZqdOnjEY-scgyCAwjWXeorz',
    'metal-l2': 'https://testnet.rpc.metall2.com',
    'mode-testnet': 'https://sepolia.mode.network',
};

export async function POST(request) {
    try {
        const { userId, amount, chain, userAddress } = await request.json();

        if (!userId || !amount || !chain || !userAddress) {
            return new NextResponse('User ID, amount, chain, and user address are required', { status: 400 });
        }
        // Get the contract account
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            console.error("Private key is missing.");
            return;
        }



        console.log("Amount", amount)
        // Initialize Web3 and contract
        const web3 = new Web3(new Web3.providers.HttpProvider(providerUrls[chain]));
        const contract = new web3.eth.Contract(abi, contractAddresses[chain]);
        const contractAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
        const fromAddress = contractAccount.address;
        // Create the transaction for withdrawal
        const tx = {
            from: fromAddress,
            to: contractAddresses[chain],
            data: contract.methods.withdraw(userId, amount.toString(16), userAddress).encodeABI(),
        };

        // Estimate gas limit
        const estimatedGas = await web3.eth.estimateGas(tx);

        // Create the transaction with estimated gas limit
        const txWithGas = {
            ...tx,
            gas: estimatedGas,
            maxFeePerGas: web3.utils.toWei('50', 'gwei'),
            maxPriorityFeePerGas: web3.utils.toWei('10', 'gwei'),
        };

        console.log("txWithGas", txWithGas)

        const signedTx = await web3.eth.accounts.signTransaction(txWithGas, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        return new NextResponse('Failed to process withdrawal', { status: 500 });
    }
}