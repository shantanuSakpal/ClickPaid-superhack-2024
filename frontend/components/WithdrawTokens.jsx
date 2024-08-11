import {useContext, useEffect, useState} from 'react';
import Web3 from 'web3';
import abi from "@/app/abis/abi";
import {useSession} from "next-auth/react";
import {toast} from "react-hot-toast";
import {GlobalContext} from "@/app/contexts/UserContext";

const WithdrawTokens = () => {
    const [tokenAmt, setTokenAmt] = useState('');
    const [status, setStatus] = useState('');
    const [userId, setUserId] = useState("")
    const {data: session} = useSession();
    const contractAddress = "0x9620e836108aFE5F15c6Fba231DCCDb7853c5480"
    const {userData} = useContext(
        GlobalContext
    )
    const handleWithdrawTokens = async (e) => {
        e.preventDefault();
        setStatus('Processing...');
        const userAddress = "0xe227573Ac0188C13660e21f8994459A3CBF71306"
        if (!userId || !userAddress) {
            toast.error("No user or user address");
            return;
        }

        try {
            // Connect to Web3
            const web3 = new Web3(new Web3.providers.HttpProvider('https://optimism-sepolia.infura.io/v3/b725fe7c53164e5da34a10cc350877c4'));
            const contract = new web3.eth.Contract(abi, contractAddress);

            // Get the contract account
            const privateKey = process.env.PRIVATE_KEY;
            if (!privateKey) {
                console.error("Private key is missing.");
                return;
            }

            const contractAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
            const fromAddress = contractAccount.address;

            // Create transaction object
            const transactionObject = {
                from: fromAddress,
                to: contractAddress,
                data: contract.methods.withdraw(userId, tokenAmt).encodeABI(),
                gas: 2000000,
                maxFeePerGas: web3.utils.toWei('50', 'gwei'),
                maxPriorityFeePerGas: web3.utils.toWei('10', 'gwei'),
            };


            // Sign and send the transaction
            const signedTx = await web3.eth.accounts.signTransaction(transactionObject, privateKey);
            const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

            setStatus('Withdraw successful!');
        } catch (error) {
            console.error('Error:', error);
            setStatus('Withdraw failed. Please try again.');
        }
    };

    useEffect(() => {
        if (userData) {
            setUserId(userData.id)
        }
    }, [userData]);
    return (
        <div className="p-5 mt-5 flex flex-col gap-3 border-2 rounded ">
            <h2 className="text-lg font-bold">Withdraw tokens ETH</h2>
            <form onSubmit={handleWithdrawTokens}>

                <div className="mb-3">
                    <label htmlFor="ethAmount">Number of tokens to withdraw:</label>
                    <input
                        className="border-2 rounded mx-3"
                        type="number"
                        id="ethAmount"
                        step="0.01"
                        value={tokenAmt}
                        onChange={(e) => setTokenAmt(e.target.value)}
                        required
                    />
                </div>
                <button className="px-4 py-2 rounded bg-theme-blue-light hover:bg-theme-blue text-white"
                        type="submit">Withdraw tokens
                </button>
            </form>
            {status && <p>{status}</p>}
        </div>
    );
};

export default WithdrawTokens;