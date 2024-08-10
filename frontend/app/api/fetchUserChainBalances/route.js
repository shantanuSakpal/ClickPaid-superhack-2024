import { NextResponse } from "next/server";
import Web3 from 'web3';
import abi from "@/app/abis/abi";
;

// Define contract addresses and provider URLs for different chains
const contractAddresses = {
    "base-sepolia": "0x26ed997929235be85c7a2d54ae7c60d91e443ea1",
    "op-sepolia": "0x9620e836108aFE5F15c6Fba231DCCDb7853c5480",
    "mode-testnet": "0x821EC6AeEf9DA466eac1f297D29d81251F50C50F",
    "metal-l2": "0x821EC6AeEf9DA466eac1f297D29d81251F50C50F",
}

const providerUrls = {
    'op-sepolia': 'https://optimism-sepolia.infura.io/v3/b725fe7c53164e5da34a10cc350877c4',
    'base-sepolia': 'https://base-sepolia.g.alchemy.com/v2/5gfYGR46TZqdOnjEY-scgyCAwjWXeorz',
    'metal-l2': 'https://testnet.rpc.metall2.com',
    'mode-testnet': 'https://sepolia.mode.network',
};

// Price service connection for fetching ETH price in USD
const PriceServiceConnection = require("@pythnetwork/price-service-client").PriceServiceConnection;

export async function POST(request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return new NextResponse('User ID is required', { status: 400 });
        }

        const connection = new PriceServiceConnection("https://hermes.pyth.network");
        const priceId = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"; // ETH/USD price id

        const currentPrices = await connection.getLatestPriceFeeds([priceId]);
        const ethPriceData = currentPrices[0].price;
        const ethPrice = parseFloat(ethPriceData.price) / 1e8; // Convert from integer to float

        const balances = {};

        for (const chain of Object.keys(contractAddresses)) {
            const web3 = new Web3(new Web3.providers.HttpProvider(providerUrls[chain]));
            const contract = new web3.eth.Contract(abi, contractAddresses[chain]);

            try {
                const balanceWei = await contract.methods.fetchUserBalance(userId).call(); // Fetch balance in Wei
                const balanceEth = web3.utils.fromWei(balanceWei.toString(), 'ether'); // Convert to ETH
                const balanceUsd = (parseFloat(balanceEth) * ethPrice).toFixed(2); // Convert to USD

                balances[chain] = {
                    wei: balanceWei.toString(),
                    eth: balanceEth.toString(),
                    usd: balanceUsd.toString(),
                };
            } catch (error) {
                console.error(`Error fetching balance for ${chain}:`, error);
                balances[chain] = {
                    eth: '0',
                    usd: '0',
                };
            }
        }

        return NextResponse.json(balances);
    } catch (error) {
        console.error("Error fetching balances:", error);
        return new NextResponse('Failed to fetch balances', { status: 500 });
    }
}