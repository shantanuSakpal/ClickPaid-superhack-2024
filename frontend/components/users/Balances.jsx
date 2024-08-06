import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import LoadingSpinner from "@components/LoadingSpinner";
import Link from "next/link";


export default function Balances() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tokenBalance, setTokenBalance] = useState({});
    const {data: session} = useSession();
    const userId = session?.user?.id;

    const getTokenBalance = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/getUserTokenBalance', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId}),
            });
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data = await response.json();
            setTokenBalance(data);
            /*
            tokenBalance = {
                "realTokenBalance": 2,
                "trialTokenBalance": 0
            }
             */
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTokenBalance();
    }, []);
    return (
        <div className="p-4">
            {
                loading ? <LoadingSpinner/> : error ? <p>{error}</p> : (
                    <div>
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold">Token Balance: {tokenBalance.realTokenBalance}</h2>
                        </div>
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold">Trial Token Balance: {tokenBalance.trialTokenBalance}</h2>
                        </div>
                        <div className="mt-5 flex gap-5 items-center">
                            {/*form to buy tokens*/}
                            <button
                                className="px-4 py-2 bg-theme-blue-light hover:bg-theme-blue rounded-lg text-white font-bold">
                                Buy Tokens
                            </button>
                            <button
                                className="px-4 py-2 bg-theme-blue-light hover:bg-theme-blue rounded-lg text-white font-bold">
                                Withdraw Tokens
                            </button>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
