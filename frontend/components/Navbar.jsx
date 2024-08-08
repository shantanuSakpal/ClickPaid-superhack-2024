"use client";
import React, {useEffect, useState} from "react";
import Link from "next/link";
import {FaBars, FaTimes} from "react-icons/fa";
import BrandLogo from "@/components/BrandLogo";
import {useSession, signIn} from "next-auth/react"
import {CgProfile} from "react-icons/cg";
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/20/solid";
import {GlobalContext} from "@/app/contexts/UserContext";
import {useContext} from "react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {data: session} = useSession()
    console.log("session", session)
    const { userData, setUserData, selectedChain, setSelectedChain } = useContext(GlobalContext);

    const chains = [
        {name: 'OP Sepolia', image: '/chain/optimism.jpeg', apiEndpoint: '/api/chain/op-sepolia/createPost'},
        {name: 'Base Sepolia', image: '/chain/base.jpeg', apiEndpoint: '/api/chain/base-sepolia/createPost'},
        {name: 'Mode TestNet', image: '/chain/mode.png', apiEndpoint: '/api/chain/mode-testnet/createPost'},
        {name: 'Metal L2', image: '/chain/metal-L2.png', apiEndpoint: '/api/chain/metal-L2/createPost'},
    ];

    useEffect(() => {
        setSelectedChain(chains[0]);
        setUserData(session?.user);
        localStorage.setItem("selectedChain", JSON.stringify(chains[0]));
    }, [session])

    return (
        <nav className="fixed top-0 left-0 w-full z-10 border-b bg-white">

            <div className=" mx-auto px-3">
                <div className="flex justify-between">
                    <div className="flex">
                        <BrandLogo/>
                    </div>
                    <div className="hidden md:flex gap-2 items-center justify-center font-bold  ">
                        <Link href="/create" className=" px-3 py-1 rounded-lg hover:text-black text-gray-500">
                            Create
                        </Link>
                        <Link href="/vote" className=" px-3 py-1 rounded-lg hover:text-black text-gray-500">
                            Vote
                        </Link>

                        <div>
                            {userData?.rewards ? `Rewards: ${userData.rewards}` : "Rewards: 0"} USD
                        </div>


                        {/*login with world id*/}
                        {
                            session ? (
                                <Link
                                    href="/profile"
                                    className=" px-3 py-1 text-black text-2xl rounded-lg hover:text-theme-blue font-bold"
                                ><CgProfile/>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => signIn('worldcoin')}
                                    className=" mx-4 px-3 py-1 text-white bg-theme-blue-light hover:bg-theme-blue rounded-lg "
                                >Login with World ID</button>
                            )
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
                        {/*<Link className=" py-1 hover:text-black text-gray-500" href="/earn">Your Rewards</Link>*/}
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