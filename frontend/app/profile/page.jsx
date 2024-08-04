"use client";
import React from 'react';
import { useSession, signOut } from "next-auth/react";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import { User } from "@nextui-org/user";
import { Button } from "@nextui-org/react";
// Import your components here
import Balances from '@components/users/Balances'; // Adjust paths if needed
import Transactions from '@components/users/Transactions'; // Renamed to Transactions
import Votes from '@components/users/Votes'; // New component for Votes
import Posts from '@components/users/Posts';

function Page() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = React.useState('Balances');

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    return (
        <div className='px-20 '>
            {/* User Component */}
            <div className='flex items-center space-x-4 p-4 min-h-[15vh]'>
                <User
                    name={session?.user.name || "Jane Doe"}
                    description="Product Designer"
                    avatarProps={{
                        src: "https://i.pravatar.cc/150?u=a04258114e29026702d"
                    }}
                />
                
                {/* Sign Out Button */}
                <Button color="default" className="p-4 rounded" onClick={() => signOut()}>Sign Out</Button>

            </div>

            {/* Tabs Component */}
            <div className="flex w-full min-h-[90vh] flex-col">
                <Tabs aria-label="Options" onChange={handleTabChange}>
                    <Tab key="Balances" className='min-w-[15vh]' title="Balances">
                        <Balances />
                    </Tab>
                    <Tab key="Transactions" className='min-w-[15vh]' title="Transactions">
                        <Transactions />
                    </Tab>
                    <Tab key="Votes" className='min-w-[15vh]' title="Votes">
                        <Votes />
                    </Tab>
                    <Tab key="Posts" className='min-w-[15vh]' title="Posts">
                        <Posts />
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}

export default Page;
