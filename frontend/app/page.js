"use client";
import Image from "next/image";
import Link from "next/link";
import {useSession, signIn, signOut} from "next-auth/react"
import React from "react";
import {FaArrowRightLong} from "react-icons/fa6";

export default function Home() {
    const {data: session} = useSession()
    // console.log("session", session)


    return (<>

            <main className="flex  flex-col items-center justify-between ">
                {/*header info*/}
                <div className="flex justify-center items-center w-full py-8 px-2 gap-5">
                    <div className="w-1/2 px-10 gap-3 flex flex-col">
                        <h1 className="text-5xl font-bold text-theme-gray-dark">Boost Your Views. <br/> Reward the
                            Community.</h1>
                        <p className="text-2xl text-justify">Upload or Create amazing thumbnails using AI, and let the
                            Community choose the best one! <br/>

                        </p>
                        {/*login with world id*/}
                        {
                            session ? (
                                <Link
                                    href={"/create"}
                                    className="w-fit mt-5 bg-theme-blue-light hover:bg-theme-blue   font-bold text-xl  rounded-full py-2 px-10 flex  gap-3 flex-row items-center justify-center text-white"
                                ><span>Get started</span> <FaArrowRightLong/>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => {
                                        signIn("worldcoin")
                                    }}
                                    className="w-fit mt-5 bg-theme-blue-light hover:bg-theme-blue   font-bold text-xl  rounded-full py-2 px-5 flex flex-row items-center justify-center text-white">
                                    <svg version="1.1" id="katman_1" xmlns="http://www.w3.org/2000/svg"
                                         x="0px" y="0px"
                                         viewBox="0 0 445.2 315.2"
                                         fill="white"
                                         className="h-10 w-auto"
                                    >
                                        <path className="st0" d="M327.6,115.2c-3-7.5-6.8-14.6-11.3-21.3c-20.3-30-54.7-49.7-93.6-49.7c-62.4,0-112.9,50.6-112.9,112.9
	c0,62.4,50.6,113,112.9,113c39,0,73.3-19.7,93.6-49.7c4.5-6.6,8.2-13.7,11.3-21.2c5.2-13,8.1-27.2,8.1-42
	C335.6,142.4,332.8,128.2,327.6,115.2z M312.5,145.7H183.2c2-7,5.7-13.2,10.7-18.1c7.6-7.6,18.1-12.3,29.7-12.3H303
	C307.9,124.6,311.1,134.8,312.5,145.7z M222.1,66.1c25.7,0,49,10.7,65.6,27.9h-61.3c-17.5,0-33.3,7.1-44.7,18.5
	c-8.9,8.9-15.1,20.3-17.4,33.2h-32.5C137.4,100.8,175.7,66.1,222.1,66.1z M222.1,248.4c-46.4,0-84.7-34.7-90.4-79.6h32.5
	c5.4,29.4,31.2,51.7,62.2,51.7h61.3C271.2,237.7,247.9,248.4,222.1,248.4z M223.6,199.3c-19.2,0-35.4-12.9-40.4-30.5h129.3
	c-1.4,10.9-4.7,21.1-9.5,30.5H223.6z"/>
                                    </svg>

                                    <span>Login to get started</span>
                                </button>
                            )
                        }


                    </div>
                    <div className="w-1/2">
                        <Image src="/img/friends.jpg" alt="friends image" width={400} height={200} className="mx-auto"/>
                    </div>
                </div>

                {/*features*/}
                <div className="flex justify-center  w-full my-5 p-10 gap-10 text-center">
                    <div className="w-1/3">
                        <div className="icon">

                        </div>
                        <h2 className="text-2xl font-extrabold text-theme-blue-light">Empowering Creators,<br/> One
                            Thumbnail at
                            a
                            Time</h2>
                        <p className="mt-1 mb-5 text-lg">Upload Your Content or Generate Thumbnails using AI and Let the
                            Community Decide!</p>
                        <Link href="/create"
                              className="px-5 py-2 text-white rounded-full text-lg font-bold hover:bg-theme-blue bg-theme-blue-light mt-4">
                            Let&apos;s go!
                        </Link>
                    </div>
                    <div className="w-1/3">
                        <div className="icon">

                        </div>
                        <h2 className="text-2xl font-extrabold text-theme-blue-light">Cast Your Vote,<br/> Shape the
                            Spotlight</h2>
                        <p className="mt-1 mb-5 text-lg">Shape the Fate of Creators&apos; Content and Decide What Goes
                            Viral!</p>
                        <Link href="/vote"
                              className="px-5 py-2 text-white rounded-full text-lg font-bold hover:bg-theme-blue bg-theme-blue-light mt-4">
                            Vote now!
                        </Link>
                    </div>

                    <div className="w-1/3">
                        <div className="icon">

                        </div>
                        <h2 className="text-2xl font-extrabold text-theme-blue-light">Rewarding Your Influence,<br/>One
                            Vote at
                            a Time</h2>
                        <p className="mt-1 mb-5 text-lg">Earn rewards for Shaping the Content Landscape and Deciding
                            What
                            Gets Seen</p>
                        <Link href="/create"
                              className="px-5 py-2 text-white rounded-full text-lg font-bold hover:bg-theme-blue bg-theme-blue-light mt-4">
                            See your rewards!
                        </Link>
                    </div>
                </div>
                {/*video tutorial*/}
                <div className="flex justify-center items-center w-full my-5 p-10">
                    <div className="w-1/2 rounded-lg overflow-clip shadow-lg shadow-gray-500">
                        <iframe width="100%" height="315"
                                src="https://www.youtube.com/embed/IHq2Y1JXrt4">
                        </iframe>
                    </div>
                    <div className="w-1/2 p-10">
                        <h2 className="text-4xl text-center font-extrabold text-theme-blue-light mb-4">How it Works</h2>
                        <p className="mt-1 mb-4 text-lg">Creators upload or create their content thumbnails and set a
                            reward. The community then votes on the best thumbnail, with a limited number of votes
                            available, and earns a share of the reward for participating. The creator now know what the
                            community wants and can use the winning thumbnail for their content for better reach.
                        </p>
                    </div>
                </div>


            </main>

        </>
    );
}
