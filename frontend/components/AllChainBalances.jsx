import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Input } from "@nextui-org/react";
import {toast, Toaster} from 'react-hot-toast';


const chains = [
    { name: 'OP Sepolia', key: 'op-sepolia', image: '/chain/optimism.jpeg' },
    { name: 'Base Sepolia', key: 'base-sepolia', image: '/chain/base.jpeg' },
    { name: 'Mode TestNet', key: 'mode-testnet', image: '/chain/mode.png' },
    { name: 'Metal L2', key: 'metal-l2', image: '/chain/metal-L2.png' },
];

const AllChainBalances = ({ userId }) => {
    const [balances, setBalances] = useState({});
    const [ethPrice, setEthPrice] = useState(0); // Assuming you have a way to fetch ETH price

    useEffect(() => {
        fetchBalances();
    }, [userId]);

    const fetchBalances = async () => {
        if (!userId) return;

        try {
            console.log("Fetching balances for user:", userId);
            const response = await fetch('/api/fetchUserChainBalances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch balances');
            }

            const data = await response.json();
            setBalances(data);
            console.log(data);
        } catch (error) {
            console.error("Error fetching balances:", error);
        }
    };



    const handleWithdraw = async (chainKey) => {
        console.log("Withdraw amount in chain:", chainKey);
        const amountToWithdraw = balances[chainKey].wei;
        console.log("Amount to withdraw:", amountToWithdraw);

        try {
            const response = await fetch('/api/withdrawUserBalance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    amount: amountToWithdraw.toString(),
                    chain: chainKey,
                }),
            });

            if(response.ok){
                toast.success("Withdrawal successful");
            }

            if (!response.ok) {
                toast.error("Failed to withdraw balance");
            }

            const data = await response.json();
            console.log("Withdrawal successful:", data);
            // Optionally, you can refresh the balances after withdrawal
            fetchBalances();
        } catch (error) {
            console.error("Error during withdrawal:", error);
        }
    };

    return (
        <div className="p-4 ml-[30vh]">
            {chains.map((chain, index) => (
                <div key={index} className="flex items-center justify-between p-4 mb-2 w-[80%] h-[15vh] border border-gray-250 rounded-xl">
                    <div className="flex items-center space-x-4">
                        <img src={chain.image} alt={chain.name} className="w-12 h-12 rounded-full" />
                        <p className="font-semibold">{chain.name}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                            <>

                                <ButtonGroup>
                                    <Button color="default" className="rounded-xl" onClick={() => handleWithdraw(chain.key)}>Withdraw</Button>
                                </ButtonGroup>
                            </>


                    </div>
                </div>
            ))}
        </div>
    );
};

export default AllChainBalances;