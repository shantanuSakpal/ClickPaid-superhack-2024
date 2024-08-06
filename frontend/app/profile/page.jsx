"use client";
import React, {useEffect, useState} from 'react';
import { useSession, signOut } from "next-auth/react";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import Balances from '@components/users/Balances'; // Adjust paths if needed
import Transactions from '@components/users/Transactions'; // Renamed to Transactions
import Votes from '@components/users/Votes'; // New component for Votes
import Posts from '@components/users/Posts';

function Page() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('Posts');
    const [nameInitials, setNameInitials] = useState('');

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    useEffect(() => {
        if (session?.user.name) {
            const initials = session.user.name.split(' ').map((n) => n[0]).join('');
            setNameInitials(initials);
        }
    }, [session]);

    return (
        <div className='px-20 '>
            {/* User Component */}
            <div className='flex items-center gap-10 mb-10'>
                <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-theme-blue-light font-bold text-lg rounded-full flex items-center justify-center'>
                        {nameInitials}
                    </div>
                    <div className="flex flex-col">
                        <div className="text-lg font-bold">{session?.user.name}</div>
                        <div className="text-sm">{session?.user.tokens.realTokenBalance} tokens</div>
                    </div>
                </div>

                {/* Sign Out Button */}
                <button  className="px-4 py-2 ml-5 rounded-lg bg-gray-300 hover:bg-red-500" onClick={() => {
                    localStorage.removeItem('user');
                    signOut()
                }}>Sign Out</button>

            </div>

            {/* Tabs Component */}
            <div className="flex w-full  flex-col justify-center">
                <Tabs aria-label="Options" onChange={handleTabChange}>
                    <Tab key="Posts" className='min-w-[15vh]' title="Posts">
                        <Posts />
                    </Tab>
                    <Tab key="Balances" className='min-w-[15vh]' title="Balances">
                        <Balances />
                    </Tab>
                    <Tab key="Transactions" className='min-w-[15vh]' title="Transactions">
                        <Transactions />
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
