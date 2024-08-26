"use client";
import {SessionProvider} from "next-auth/react"
import {GlobalProvider} from "@/app/contexts/UserContext";

require('dotenv').config();
export default function Providers({children, session}) {
    return (

        <SessionProvider session={session}>
            <GlobalProvider>
                    {children}
            </GlobalProvider>
        </SessionProvider>
    )
}