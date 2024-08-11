import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import PriceConverter from "@components/PriceConvertor";
import AllChainBalances from "@components/AllChainBalances";

export default function Balances({userId}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {data: session} = useSession();

    return (
        <div className="p-4">
             <AllChainBalances userId={userId}/>
             <PriceConverter />
        </div>
    );
}
