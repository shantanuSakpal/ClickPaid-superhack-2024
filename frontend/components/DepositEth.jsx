import {useEffect, useState} from 'react';
import Web3 from 'web3';
import abi from "@/app/abis/abi";
import {useSession} from "next-auth/react";
import {toast} from "react-hot-toast";

const DepositForm = () => {
    const [ethAmount, setEthAmount] = useState('');
    const [status, setStatus] = useState('');
    const [userId, setUserId] = useState("")
    const {data: session} = useSession();

    const handleDeposit = async (e) => {
        e.preventDefault();
        setStatus('Processing...');
        if (!userId) {
            toast.error("No user");
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
                const weiAmount = web3.utils.toWei(ethAmount, 'ether');

                // Call deposit function
                await contract.methods.deposit(userId, weiAmount).send({
                    from: account,
                    value: weiAmount,

                });

                setStatus('Deposit successful!');
            } else {
                setStatus('Please install MetaMask to use this feature.');
            }
        } catch (error) {
            console.error('Error:', error);
            setStatus('Deposit failed. Please try again.');
        }
    };

    useEffect(() => {
        if (session) {
            setUserId(session?.user.id)
        }
    }, [session]);
    return (
        <div className="p-5 mt-5 flex flex-col gap-3 border-2 rounded ">
            <h2 className="text-lg font-bold">Deposit ETH</h2>
            <form onSubmit={handleDeposit}>

                <div className="mb-3">
                    <label htmlFor="ethAmount">ETH Amount:</label>
                    <input
                        className="border-2 rounded mx-3"
                        type="number"
                        id="ethAmount"
                        step="0.01"
                        value={ethAmount}
                        onChange={(e) => setEthAmount(e.target.value)}
                        required
                    />
                </div>
                <button className="px-4 py-2 rounded bg-theme-blue-light hover:bg-theme-blue text-white" type="submit">Deposit</button>
            </form>
            {status && <p>{status}</p>}
        </div>
    );
};

export default DepositForm;