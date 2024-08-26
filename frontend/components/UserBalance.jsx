import React, {useEffect, useState} from "react";
import {Button, ButtonGroup, Input} from "@nextui-org/react";
import {toast, Toaster} from 'react-hot-toast';
import LoadingSpinner from "@components/LoadingSpinner";


const UserBalance = ({userId}) => {
    const [balance, setBalance] = useState();
    const [loading, setLoading] = useState(false);
    const [withdrawingBalance, setWithdrawingBalance] = useState();

    useEffect(() => {
        fetchBalance();
    }, [userId]);

    const fetchBalance = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            // console.log("Fetching balance for user:", userId);
            const response = await fetch('/api/fetchUserBalance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({userId}),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch balance');
            }

            const data = await response.json();
            setBalance(data);
            console.log("data", data);
        } catch (error) {
            console.error("Error fetching balance:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        try {
            setWithdrawingBalance(true);
            // const response = await fetch('/api/withdrawUserBalance', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         userId,
            //         amount: amountToWithdraw.toString(),
            //         userAddress: userAddress,
            //     }),
            // });
            //
            // if (response.ok) {
            //     toast.success("Withdrawal successful");
            //     fetchBalance();
            // } else {
            //     toast.error("Failed to withdraw balance");
            // }
        } catch (error) {
            console.error("Error during withdrawal:", error);
            toast.error("Error during withdrawal");
        } finally {
            setWithdrawingBalance(false);
        }
    };

    return (
        <div className="px-5">
            <h2 className="text-xl font-bold my-5">{
                loading ? "Getting current balance..." : "Current Balance"
            }</h2>
            <div>{
                loading ? <LoadingSpinner/> : (
                   <div className="flex flex-row gap-5 items-center">
                       {
                           balance && <div>{balance.toString()} tokens</div>
                       }
                       <Button
                           color={withdrawingBalance ? "default" : "primary"}
                           className={`text-sm font-semibold rounded-xl ${withdrawingBalance ? "cursor-not-allowed" : ""}`}
                           disabled={withdrawingBalance}
                           onClick={handleWithdraw}
                       >
                           {withdrawingBalance ? "Withdrawing..." : "Withdraw"}
                       </Button>
                   </div>


                )

            }</div>

        </div>
    );
};

export default UserBalance;