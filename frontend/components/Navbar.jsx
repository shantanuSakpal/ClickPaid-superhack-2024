"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <nav className="bg-theme-gray-dark  text-white ">
            <div className=" mx-auto p-2">
                <div className="flex justify-between">
                    <div className="flex">
                            <BrandLogo/>
                    </div>
                    <div className="hidden md:flex gap-2 items-center justify-center font-bold  ">
                        <Link href="/create" className="text-lg px-3 py-1 rounded-lg hover:bg-theme-gray-light">
                            Create
                        </Link>
                        <Link href="/vote" className="text-lg px-3 py-1 rounded-lg hover:bg-theme-gray-light">
                            Vote
                        </Link>
                        <Link href="/earn" className="text-lg px-3 py-1 rounded-lg hover:bg-theme-gray-light">
                            Earn
                        </Link>
                        <Link href="/auth/login" className="text-lg mx-4 px-3 py-1 bg-theme-purple hover:bg-theme-purple-dark rounded-lg ">
                            Login
                        </Link>
                    </div>

                    <button
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        className="md:hidden px-4 text-lg"

                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <FaTimes/> : <FaBars/>}
                    </button>
                </div>
                <div className="md:hidden my-2">
                    {isMenuOpen && (
                        <div className="  flex flex-col gap-2 text-xl border-t border-theme-gray-light">
                            <Link className=" py-3 px-4 hover:bg-theme-gray-light" href="/create">Create</Link>
                            <Link className=" py-3 px-4 hover:bg-theme-gray-light"  href="/vote">Vote</Link>
                            <Link  className=" py-3 px-4 hover:bg-theme-gray-light" href="/earn">Earn</Link>
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
}