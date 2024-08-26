import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import UserBalance from "@components/UserBalance";

export default function Balances({userId}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {data: session} = useSession();

    return (
        <div className="p-4">
             <UserBalance userId={userId}/>
        </div>
    );
}
