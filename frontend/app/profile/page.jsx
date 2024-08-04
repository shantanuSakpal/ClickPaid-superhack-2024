"use client";
import React from 'react';
import {useSession, signOut} from "next-auth/react"

function Page(props) {
    const {data: session} = useSession()
    return (
        <div>
            <div>{session?.user.name}</div>
            <button className="p-4 bg-theme-blue-light m-3 rounded" onClick={() => signOut()}>Sign Out</button>
        </div>
    );
}

export default Page;