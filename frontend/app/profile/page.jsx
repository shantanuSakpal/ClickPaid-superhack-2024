"use client";
import React, {useEffect, useState} from 'react';
import {useSession, signOut} from "next-auth/react";
import {Tabs, Tab, Card, CardBody} from "@nextui-org/react";
import {Button} from "@nextui-org/react";
import Balances from '@components/users/Balances'; // Adjust paths if needed
import Transactions from '@components/users/Transactions'; // Renamed to Transactions
import Votes from '@components/users/Votes'; // New component for Votes
import Posts from '@components/users/Posts';
import {client} from "@/app/_utils/thirdwebClient";
import {ConnectButton} from "thirdweb/react";
import {useActiveAccount, useDisconnect, useActiveWallet} from "thirdweb/react";


function Page() {
    const {data: session} = useSession();
    const [activeTab, setActiveTab] = useState('Posts');
    const [nameInitials, setNameInitials] = useState('');
    const handleTabChange = (key) => {
        setActiveTab(key);
    };
    const {disconnect} = useDisconnect();
    const wallet = useActiveWallet();
    const [loading, setLoading] = useState(false);


    const chains = [
        {name: 'OP Sepolia', image: '/chain/optimism.jpeg', apiEndpoint: '/api/chain/op-sepolia/createPost'},
        {name: 'Base Sepolia', image: '/chain/base.jpeg', apiEndpoint: '/api/chain/base-sepolia/createPost'},
        {name: 'Mode TestNet', image: '/chain/mode.png', apiEndpoint: '/api/chain/mode-testnet/createPost'},
        {name: 'Metal L2', image: '/chain/metal-L2.png', apiEndpoint: '/api/chain/metal-L2/createPost'},
    ];


    const account = useActiveAccount();

    const handleSignOut = async () => {
        setLoading(true);
        await disconnect(wallet);
        localStorage.removeItem('user');
        await signOut({ callbackUrl: 'http://localhost:3000/' })
        setLoading(false)
    }

    useEffect(() => {
        if (session?.user.name) {
            const initials = session.user.name.split(' ').map((n) => n[0]).join('');
            setNameInitials(initials);
        }
    }, [session]);

    return (
        <div className='px-20 min-h-screen'>
            {/* User Component */}
            <div className='flex items-center gap-10 mb-10'>
                <div className='flex items-center space-x-4'>
                    <div
                        className='w-12 h-12 bg-theme-blue-light font-bold text-lg rounded-full flex items-center justify-center'>
                        {nameInitials}
                    </div>
                    <div className="flex flex-col">
                        <div className="text-lg font-bold">{session?.user.name}</div>
                        <div className="text-sm">{session?.user.tokens.realTokenBalance} tokens</div>
                    </div>
                </div>

                {/* Sign Out Button */}
                <button
                    disabled={loading}
                    className="px-4 py-2 ml-5 rounded-lg bg-gray-300 hover:bg-red-500" onClick={() => {
                    handleSignOut();
                }}>{
                    loading ? 'Signing out...' : 'Sign Out'
                }
                </button>

                <div>
                    <ConnectButton client={client}/>
                </div>

            </div>



            {/* Tabs Component */}
            <div className="flex w-full  flex-col justify-center">
                <Tabs aria-label="Options" onChange={handleTabChange}>
                    <Tab key="Posts" className='min-w-[15vh]' title="Posts">
                        <Posts/>
                    </Tab>
                    <Tab key="Balances" className='min-w-[15vh]' title="Balances">
                        <Balances/>
                    </Tab>
                    <Tab key="Transactions" className='min-w-[15vh]' title="Transactions">
                        <Transactions/>
                    </Tab>
                    {/*<Tab key="Votes" className='min-w-[15vh]' title="Votes">*/}
                    {/*    <Votes />*/}
                    {/*</Tab>*/}

                </Tabs>
            </div>
        </div>
    );
}

export default Page;
