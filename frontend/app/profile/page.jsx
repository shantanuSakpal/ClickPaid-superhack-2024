"use client";
import React, {useEffect, useState} from 'react';
import {useSession, signOut} from "next-auth/react";
import {Tabs, Tab, Card, CardBody} from "@nextui-org/react";
import Balances from '@components/users/Balances';
import Transactions from '@components/users/Transactions'; // Renamed to Transactions
import Posts from '@components/users/Posts';
import {Toaster} from "react-hot-toast";
import {GlobalContext} from "@/app/contexts/UserContext";
import {useContext} from "react";

function Page() {
    const {data: session} = useSession();
    const {userData, setUserData,} = useContext(GlobalContext);
    const [activeTab, setActiveTab] = useState('Posts');
    const [nameInitials, setNameInitials] = useState('');
    const handleTabChange = (key) => {
        setActiveTab(key);
    };
    const [loading, setLoading] = useState(false);


    const handleSignOut = async () => {
        setLoading(true);
        localStorage.removeItem('user');
        await signOut({callbackUrl: 'http://localhost:3000/'})
        setLoading(false)
    }

    useEffect(() => {
        if (userData) {
            const initials = userData.name.split(' ').map((n) => n[0]).join('');
            setNameInitials(initials);
        }
    }, [userData]);

    return (
        <div className='px-20 min-h-screen'>
            <Toaster position="center"/>
            {/* User Component */}
            <div className='flex items-center gap-10 mb-10'>
                <div className='flex items-center space-x-4'>
                    <div
                        className='w-12 h-12 bg-theme-blue-light font-bold text-lg rounded-full flex items-center justify-center'>
                        {nameInitials}
                    </div>
                    <div className="flex flex-col">
                        <div className="text-lg font-bold">{userData?.name}</div>

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
            </div>
            {/* Tabs Component */}
            {
                userData &&
                <div className="flex w-full  flex-col justify-center">
                    <Tabs aria-label="Options" onChange={handleTabChange}>
                        <Tab key="Posts" className='min-w-[15vh]' title="Posts">
                            <Posts/>
                        </Tab>
                        <Tab key="Balances" className='min-w-[15vh]' title="Balances">
                            <Balances userId={userData.id} />
                        </Tab>
                        <Tab key="Transactions" className='min-w-[15vh]' title="Transactions">
                            <Transactions/>
                        </Tab>
                        {/*<Tab key="Votes" className='min-w-[15vh]' title="Votes">*/}
                        {/*    <Votes />*/}
                        {/*</Tab>*/}

                    </Tabs>
                </div>
            }
        </div>
    );
}

export default Page;
