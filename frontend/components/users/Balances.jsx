import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import LoadingSpinner from "@components/LoadingSpinner";
import Link from "next/link";
import DepositEth from "@components/DepositEth";
import WithdrawTokens from "@components/WithdrawTokens";
import PriceConverter from "@components/PriceConvertor";
import AllChainBalances from "@components/AllChainBalances";

export default function Balances({userId}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {data: session} = useSession();

    return (
        <div className="p-4">
             <PriceConverter />
             <AllChainBalances userId={userId}/>
        </div>
    );
}
