"use client";
import React, {useEffect} from "react";
import Link from "next/link";
import {FaBars, FaTimes} from "react-icons/fa";
import BrandLogo from "@/components/BrandLogo";
import {IDKitWidget} from '@worldcoin/idkit'
import {toast} from 'react-hot-toast';
import axios from "axios";


export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isVerified, setIsVerified] = React.useState(false);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const APP_ID = "app_staging_752fdbd001c5de1565710da8ddb8d3a3";
    const ACTION_ID =  "login";

    const onSuccess = (result) => {
        // This is where you should perform frontend actions once a user has been verified
        setIsVerified(true);
        toast.success(`Successfully verified with World ID!`)
        // console.log("result----------------", result);
    }

    const handleVerify = async (result) => {
        /*
        response : {
            "proof": "0x2bb9c61621d847b4b9a85530db7bc7e35fc788148cfa88291330f607d4f8bd9122edf03b54bf6fde749089f88583438eaaa9f4011604c74ac4de280530a0ca470dcae12ef101b16aa58b4e0e5338d49513d7b2184508d12018351b3d516654e109f2fb72cce0ddae9d30eb42081ad67f1648ac1c18cb9af7516f9e2fadf068fc14b2b626e285e28abc6434164c98ddaaa0c91380e32332dc36debab7e579160d0125672f3397e4d01dc214a374416d4c1980ece1bb87cada327f50c69875715f28cf32758dfa5b0b958b6927c1e380c5029c9f5c59b672b76d360aa88434aab9128a26340b0b07a24e42459509f3b64480e506ca76f10bd25b59bd68bb9003c4",
            "merkle_root": "0x0e6aaf1836c1d8e844fe356014d09f5653e92e0362327e7a088b775cb4861fb4",
            "nullifier_hash": "0x0403589f79d03ca18573fe426eb5a007515a47ec20aadbc911538b60f1c8e4ba",
            "verification_level": "orb"
        }
         */
        const {proof, merkle_root, nullifier_hash, verification_level} = result;
        const body = {
            action: "login",
            proof: proof,
            merkle_root: merkle_root,
            nullifier_hash: nullifier_hash,
            verification_level: verification_level,
        }
        try {
            const response = await axios.post(`${BACKEND_URL}/v1/user/auth/login`, body);
            console.log("verified---------");
            // console.log(response.data);
            sessionStorage.setItem('token', response.data.token);

        } catch (error) {
            console.error('Error:', error.response.data);
        }
    }

    useEffect(() => {
        const isVerified = sessionStorage.getItem('token');
        if (isVerified) {
            setIsVerified(true);
        }
    }, []);

    return (<nav className="fixed top-0 left-0 w-full z-10 border-b bg-white">

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
                        <Link href="/earn" className=" px-3 py-1 rounded-lg hover:text-black text-gray-500">
                            Earn
                        </Link>
                        {isVerified ? (<button
                                onClick={() => {
                                    sessionStorage.removeItem('token');
                                    setIsVerified(false);
                                }}
                                className=" mx-4 px-3 py-1 text-white bg-theme-blue-light hover:bg-theme-blue rounded-lg "
                            >Logout</button>) : (<IDKitWidget
                            app_id={APP_ID} // obtained from the Developer Portal
                            action={ACTION_ID} // this is your action name from the Developer Portal
                            signal="login to app" // any arbitrary value the user is committing to, e.g. a vote
                            onSuccess={onSuccess}
                            handleVerify={handleVerify}
                            verification_level="device" // minimum verification level accepted, defaults to "orb"
                        >
                            {({open}) => <button
                                className=" mx-4 px-3 text-white py-1 bg-theme-blue-light hover:bg-theme-blue rounded-lg "
                                onClick={open}>Login with World Id</button>}
                        </IDKitWidget>)}


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
                            <Link className=" py-1 hover:text-black text-gray-500" href="/earn">Earn</Link>
                            <IDKitWidget
                                app_id={APP_ID} // obtained from the Developer Portal
                                action={ACTION_ID} // this is your action name from the Developer Portal
                                signal="login to app" // any arbitrary value the user is committing to, e.g. a vote
                                onSuccess={onSuccess}
                                handleVerify={handleVerify}
                                verification_level="device" // minimum verification level accepted, defaults to "orb"
                            >
                                {({open}) => <button
                                    className=" mx-4 px-3 py-2 bg-theme-blue-light hover:bg-theme-blue rounded-lg text-white font-bold"
                                    onClick={open}>Login with World Id</button>}
                            </IDKitWidget>
                        </div>)}
                </div>

            </div>
        </nav>);
}