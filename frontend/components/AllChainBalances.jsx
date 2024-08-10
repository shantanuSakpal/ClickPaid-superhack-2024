import React, {useEffect, useState} from "react";
import {Button, ButtonGroup, Input} from "@nextui-org/react";
import {toast, Toaster} from 'react-hot-toast';
import {useDisconnect, useActiveWallet} from "thirdweb/react";

const chains = [
    {name: 'OP Sepolia', key: 'op-sepolia', image: '/chain/optimism.jpeg'},
    {name: 'Base Sepolia', key: 'base-sepolia', image: '/chain/base.jpeg'},
    {name: 'Mode TestNet', key: 'mode-testnet', image: '/chain/mode.png'},
    {name: 'Metal L2', key: 'metal-l2', image: '/chain/metal-L2.png'},
];

const AllChainBalances = ({userId}) => {
    const [balances, setBalances] = useState({});
    const [ethPrice, setEthPrice] = useState(0); // Assuming you have a way to fetch ETH price
    const [loading, setLoading] = useState(false);
        const [withDrawing, setWithDrawing] = useState(false);
    const [withDrawingOp, setWithDrawingOp] = useState(false);
    const [withDrawingBase, setWithDrawingBase] = useState(false);
    const [withDrawingMode, setWithDrawingMode] = useState(false);
    const [withDrawingMetal, setWithDrawingMetal] = useState(false);

    useEffect(() => {
        fetchBalances();
    }, [userId]);
    const wallet = useActiveWallet();

    const fetchBalances = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            console.log("Fetching balances for user:", userId);
            const response = await fetch('/api/fetchUserChainBalances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({userId}),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch balances');
            }

            const data = await response.json();
            setBalances(data);
            console.log(data);
        } catch (error) {
            console.error("Error fetching balances:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleWithdraw = async (chainKey) => {
        console.log("Withdraw amount in chain:", chainKey);
        const amountToWithdraw = balances[chainKey].wei;
        console.log("Amount to withdraw:", amountToWithdraw);
        const userAddress = wallet?.getAccount().address;
        console.log("user address:", userAddress);
        try {
            withDrawing(true);
            if(chainKey === 'op-sepolia'){
                setWithDrawingOp(true);
            }else if(chainKey === 'base-sepolia'){
                setWithDrawingBase(true);
            } else if(chainKey === 'mode-testnet'){
                setWithDrawingMode(true);
            }
            else if(chainKey === 'metal-l2'){
                setWithDrawingMetal(true);
            }
            const response = await fetch('/api/withdrawUserBalance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    amount: amountToWithdraw.toString(),
                    chain: chainKey,
                    userAddress: userAddress,
                }),
            });
            const data = await response.json();

            if (response.ok) {
                console.log("Withdrawal successful:", data);
                // Optionally, you can refresh the balances after withdrawal
                toast.success("Withdrawal successful");
                fetchBalances();

            }

            if (!response.ok) {
                toast.error("Failed to withdraw balance");
            }

        } catch (error) {
            console.error("Error during withdrawal:", error);
        }
        finally {
            setWithDrawing(false);
            setWithDrawingBase(false);
            setWithDrawingOp(false);
            setWithDrawingMode(false);
            setWithDrawingMetal(false);
        }
    };

    return (
        <div className="p-4 ml-[30vh]">
            {chains.map((chain, index) => (
                <div key={index}
                     className="flex items-center justify-between p-4 mb-2 w-[80%] h-[15vh] border border-gray-250 rounded-xl">
                    <div className="flex items-center space-x-4">
                        <img src={chain.image} alt={chain.name} className="w-12 h-12 rounded-full"/>
                        <p className="font-semibold">{chain.name}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {
                            loading ? <p className="text-sm font-bold">Getting balances...</p> : (
                                <>
                                    <p className="font-medium">{balances[chain.key]?.usd ? `$${balances[chain.key].usd}` : '$0.00'}</p>

                                    {
                                        wallet && (
                                                <Button color={ withDrawing ? "default":"primary"} className={
                                                    `text-sm font-semibold rounded-xl ${withDrawing ? "cursor-not-allowed" : ""}`
                                                } disabled={withDrawing}
                                                        onClick={() => handleWithdraw(chain.key)}>{
                                                    withDrawing ? "Withdrawing..." : `Withdraw`
                                                }</Button>
                                        )
                                    }
                                </>)
                        }


                    </div>
                </div>
            ))}
        </div>
    );
};

export default AllChainBalances;