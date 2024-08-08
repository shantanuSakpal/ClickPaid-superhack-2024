"use client";
import React, {useEffect, useState} from "react";
import Link from "next/link";
import {FaBars, FaTimes} from "react-icons/fa";
import BrandLogo from "@/components/BrandLogo";
import {useSession, signIn} from "next-auth/react"
import {CgProfile} from "react-icons/cg";
import {GlobalContext} from "@/app/contexts/UserContext";
import {useContext} from "react";
import {ConnectButton} from "thirdweb/react";
import {client} from "@/app/_lib/client";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {data: session} = useSession()
    const {userData, setUserData, selectedChain, setSelectedChain} = useContext(GlobalContext);

    useEffect(() => {
        setUserData(session?.user);
        if (!selectedChain) {
            setSelectedChain({
                id: "op-sepolia",
                name: 'OP Sepolia',
                image: '/chain/optimism.jpeg',
                apiEndpoint: '/api/chain/op-sepolia/createPost'
            })
        }
    }, [session])

    return (
        <nav className="fixed top-0 py-2 left-0 w-full z-10 border-b bg-white">

            <div className=" mx-auto px-3">
                <div className="flex justify-between">
                    <div className="flex">
                        <BrandLogo/>
                    </div>
                    <div className="hidden md:flex gap-2 items-center justify-center font-bold">
                        <Link href="/create" className=" px-3 py-1 rounded-lg text-lg hover:text-black text-gray-500">
                            Create
                        </Link>
                        <Link href="/vote" className=" px-3 py-1 rounded-lg text-lg hover:text-black text-gray-500">
                            Vote
                        </Link>
                        <Link
                            href="/profile"
                            className=" px-3 py-1 rounded-lg text-lg hover:text-black text-gray-500 "
                        >Profile
                        </Link>

                    </div>
                    <div className="hidden md:flex gap-2 items-center justify-center font-bold  ">

                        {/*login with world id*/}
                        {
                            session && userData ? (
                                <div className="flex flex-row gap-3 items-center">
                                    <div className="text-sm pr-5 border-r-2 whitespace-nowrap">
                                        {userData?.rewards ? `Rewards: ${userData.rewards}` : "Rewards: 0"} USD
                                    </div>

                                    <ConnectButton client={client} theme="dark" />

                                </div>
                            ) : <div>
                                <button
                                    onClick={() => signIn('worldcoin')}
                                    className=" px-3 py-1 text-white bg-theme-blue-light hover:bg-theme-blue rounded-lg "
                                >Login with World ID
                                </button>
                            </div>
                        }

                    </div>

                    <button
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        className="md:hidden px-4 "

                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <FaTimes/> : <FaBars/>}
                    </button>
                </div>
                <div className="md:hidden my-2 bg-white">
                    {isMenuOpen && (<div
                        className=" text-center flex flex-col gap-2  border-t border-theme-blue-light py-2  font-bold">
                        <Link className=" py-1 hover:text-black text-gray-500" href="/create">Create</Link>
                        <Link className=" py-1 hover:text-black text-gray-500" href="/vote">Vote</Link>
                        {/*login with world id*/}
                        {
                            session ? (
                                <Link
                                    href="/profile"
                                    className=" mx-4 px-3 py-1 text-white bg-theme-blue-light hover:bg-theme-blue rounded-lg "
                                >Profile
                                </Link>
                            ) : (
                                <button
                                    onClick={() => signIn('worldcoin')}
                                    className=" mx-4 px-3 py-1 text-white bg-theme-blue-light hover:bg-theme-blue rounded-lg "
                                >Login with World ID</button>
                            )
                        }

                    </div>)}
                </div>

            </div>
        </nav>);
}