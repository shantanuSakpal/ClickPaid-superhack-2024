// import Web3 from 'web3';
// import path from 'path';
// import fs from 'fs';
// require('dotenv').config();
//
// // Replace with your contract address for Base Sepolia
// const contractAddress = '0xa34EDe7bd7A3567D733EA69ad7E7dC5dB600495C';
//
// // Path to the ABI JSON file
// const abiFilePath = path.resolve(process.cwd(), 'public', 'abis', 'abi.json');
// const abi = JSON.parse(fs.readFileSync(abiFilePath, 'utf8'));
//
// // Configure Web3 instance with Base Sepolia RPC URL
// const web3 = new Web3(new Web3.providers.HttpProvider('https://base-sepolia.g.alchemy.com/v2/5gfYGR46TZqdOnjEY-scgyCAwjWXeorz'));
//
// // Configure the contract
// const contract = new web3.eth.Contract(abi, contractAddress);
//
// // Middleware to sign transactions
// const signTransaction = async (transactionObject, privateKey) => {
//   const signedTx = await web3.eth.accounts.signTransaction(transactionObject, privateKey);
//   return signedTx.rawTransaction;
// };
//
// // Export the POST function for the API route
// export async function POST(req) {
//   const res = new Response(); // Create a dummy response object for handling
//   try {
//     const { postID, imageUrls, descriptions, postDescription, rewardAmount } = await req.json();
//
//     if (!postID || !imageUrls || !descriptions || !postDescription || !rewardAmount) {
//       console.error("Missing required parameters:", { postID, imageUrls, descriptions, postDescription, rewardAmount });
//       return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
//     }
//
//     const privateKey = process.env.NEXT_PRIVATE_KEY;
//     if (!privateKey) {
//       console.error("Private key is missing.");
//       return new Response(JSON.stringify({ error: 'Private key is not configured' }), { status: 500 });
//     }
//
//     // Get the from address from the private key
//     const fromAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;
//
//     // Create transaction object
//     const transactionObject = {
//       from: fromAddress, // Add the from address here
//       to: contractAddress,
//       data: contract.methods.createPost(
//         postID,
//         imageUrls,
//         descriptions,
//         postDescription,
//         web3.utils.toWei(rewardAmount.toString(), 'ether')
//       ).encodeABI(),
//       gas: 2000000, // Specify the gas limit
//       maxFeePerGas: web3.utils.toWei('50', 'gwei'), // Maximum total fee per gas
//       maxPriorityFeePerGas: web3.utils.toWei('10', 'gwei'), // Priority fee per gas
//     };
//
//     // Sign and send the transaction
//     const rawTx = await signTransaction(transactionObject, privateKey);
//     const txReceipt = await web3.eth.sendSignedTransaction(rawTx);
//
//     return new Response(JSON.stringify({ success: true, transactionHash: txReceipt.transactionHash }), { status: 200 });
//   } catch (error) {
//     console.error("Error creating post:", error);
//     return new Response(JSON.stringify({ error: 'Failed to create post' }), { status: 500 });
//   }
// }
