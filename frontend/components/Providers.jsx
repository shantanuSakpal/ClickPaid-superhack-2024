"use client";
import { SessionProvider } from "next-auth/react"
require('dotenv').config();
export default function Providers({ children, session }) {
    return (

        <SessionProvider session={session}>

                {children}
        </SessionProvider>
    )
}