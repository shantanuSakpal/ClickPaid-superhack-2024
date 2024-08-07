"use client";
import React, {useEffect, useState} from "react";
import Link from "next/link";
import {FaBars, FaTimes} from "react-icons/fa";
import BrandLogo from "@/components/BrandLogo";
import {useSession, signIn} from "next-auth/react"
import {CgProfile} from "react-icons/cg";
import {getTokenBalance} from "@/app/_utils/fetchTokens";
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/20/solid";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedChain, setSelectedChain] = useState(null)
    const {data: session} = useSession()
    console.log("session", session)

    const chains = [
        {name: 'OP Sepolia', image: '/chain/optimism.jpeg', apiEndpoint: '/api/chain/op-sepolia/createPost'},
        {name: 'Base Sepolia', image: '/chain/base.jpeg', apiEndpoint: '/api/chain/base-sepolia/createPost'},
        {name: 'Mode TestNet', image: '/chain/mode.png', apiEndpoint: '/api/chain/mode-testnet/createPost'},
        {name: 'Metal L2', image: '/chain/metal-L2.png', apiEndpoint: '/api/chain/metal-L2/createPost'},
    ];

    useEffect(() => {
        setSelectedChain(chains[0]);
        localStorage.setItem("selectedChain", JSON.stringify(chains[0]));
    }, [])

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
                        {/*<Link href="/earn" className=" px-3 py-1 rounded-lg hover:text-black text-gray-500">*/}
                        {/*    Your Rewards*/}
                        {/*</Link>*/}
                        {/*{*/}
                        {/*    session && (*/}
                        {/*        <>*/}
                        {/*            <div className="bg-theme-blue-light text-white text-sm rounded-lg px-3 py-1">*/}
                        {/*                {session?.user.tokens.realTokenBalance} tokens left*/}
                        {/*            </div>*/}
                        {/*            {*/}
                        {/*                session?.user.tokens.trialTokenBalance > 0 && (*/}
                        {/*                    <div className="bg-theme-blue-light text-white text-sm rounded-lg px-3 py-1">*/}
                        {/*                        {session?.user.tokens.trialTokenBalance} trial tokens left*/}
                        {/*                    </div>*/}
                        {/*                )*/}

                        {/*            }*/}
                        {/*        </>*/}
                        {/*    )*/}
                        {/*}*/}
                        <div className="w-fit flex gap-2">
                            <Menu as="div" className="relative inline-block text-left w-full">
                                <div>
                                    <MenuButton
                                        className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                        <img src={selectedChain?.image} alt={selectedChain?.name}
                                             className="w-5 h-5 rounded-full mr-2"/>
                                        {selectedChain?.name}
                                        <ChevronDownIcon aria-hidden="true"
                                                         className="-mr-1 h-5 w-5 text-gray-400"/>
                                    </MenuButton>
                                </div>
                                <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                >
                                    <div className="py-1">
                                        {chains.map((chain) => (
                                            <MenuItem key={chain.name}>
                                                {({active}) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedChain(chain);
                                                            localStorage.setItem("selectedChain", JSON.stringify(chain));
                                                        }}
                                                        className={`block w-full px-4 py-2 text-left text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                                                    >
                                                        <img src={chain.image} alt={chain.name}
                                                             className="w-5 h-5 rounded-full mr-2 inline"/>
                                                        {chain.name}
                                                    </button>
                                                )}
                                            </MenuItem>
                                        ))}
                                    </div>
                                </MenuItems>
                            </Menu>
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