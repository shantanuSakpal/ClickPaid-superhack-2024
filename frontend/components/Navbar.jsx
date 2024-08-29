"use client";
import React, {useEffect, useState} from "react";
import Link from "next/link";
import {FaBars, FaTimes} from "react-icons/fa";
import BrandLogo from "@/components/BrandLogo";
import {useSession, signIn} from "next-auth/react"
import {GlobalContext} from "@/app/contexts/UserContext";
import {useContext} from "react";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {db} from "@/app/_lib/fireBaseConfig";
import {adjectives, animals, uniqueNamesGenerator} from 'unique-names-generator';
import { RiCoinsLine } from "react-icons/ri";
import { usePathname } from 'next/navigation'


export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {data: session} = useSession()
    const {userData, setUserData, selectedChain, setSelectedChain} = useContext(GlobalContext);
    const [nameInitials, setNameInitials] = useState('');
    const [currentPage, setCurrentPage] = useState('/');
    const pathname = usePathname();
    // Configuration for name generation
    const nameConfig = {
        dictionaries: [adjectives, animals],
        separator: ' ',
        length: 2,
        style: 'capital'
    };

    async function getUserFromDb(userId) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Generate a random name
            const randomName = uniqueNamesGenerator(nameConfig);

            // Create a new user document in Firestore
            await setDoc(userRef, {
                id: userId,
                name: randomName,
                walletAddress: "",
                posts: [],
                votes: [],
                payouts: [],
                aiGeneratedImages: [],
                balance: 100,
                // Add any other fields you want to store
            });

            //update the user data
            setUserData({
                id: userId,
                name: randomName,
                balance: 100,
            });
        } else {
            // Retrieve user data from Firestore
            const user_data = userSnap.data();
            setUserData({
                id: user_data.id,
                name: user_data.name,
                balance: user_data.balance
            });

        }

    }

    useEffect(() => {
        if (session && !userData) {
            getUserFromDb(session.user.name)

        }

    }, [session])

    useEffect(() => {

        if (userData) {
            const initials = userData.name.split(' ').map((n) => n[0]).join('');
            setNameInitials(initials);
        }

        console.log("userData", userData)
    }, [ userData])

    useEffect(() => {

        //get current page url
        if(pathname){
            setCurrentPage(pathname);
            console.log(pathname)
        }
        console.log("userData", userData)
    }, [pathname])

    return (
        <nav className="fixed top-0 py-1 left-0 w-full z-10 border-b bg-white">

            <div className=" mx-auto px-3">
                <div className="flex justify-between">
                    <div className="flex">
                        <BrandLogo/>
                    </div>
                    <div className="hidden md:flex gap-2 items-center justify-center font-bold">
                        <Link href="/create" className={`px-3 py-1 rounded-lg text-sm  ${
                            currentPage === "/create" ? 'bg-theme-blue text-white ' : 'text-gray-500 hover:text-black'
                        }`}>
                            Create
                        </Link>
                        <Link href="/vote" className={`px-3 py-1 rounded-lg text-sm  ${
                            currentPage === "/vote" ? 'bg-theme-blue text-white ' : 'text-gray-500 hover:text-black'
                        }`}>
                            Vote
                        </Link>
                        <Link href="/profile" className={`px-3 py-1 rounded-lg text-sm  ${
                            currentPage === "/profile" ? 'bg-theme-blue text-white ' : 'text-gray-500 hover:text-black'
                        }`}>Profile
                        </Link>

                    </div>
                    <div className="hidden md:flex gap-2 items-center justify-center font-bold  ">

                        {/*login with world id*/}
                        {
                            session && userData ? (
                                <div className='flex items-center space-x-2'>
                                    <div className="flex flex-row gap-2 items-center border-r-2 px-2">
                                        <RiCoinsLine className="text-xl "/>
                                        <div className="font-bold">{userData?.balance}</div>
                                    </div>
                                    <Link href="/profile">
                                        <div
                                            className='w-8 h-8 bg-theme-blue-light font-bold rounded-full flex items-center justify-center'>
                                            {nameInitials}
                                        </div>
                                    </Link>

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