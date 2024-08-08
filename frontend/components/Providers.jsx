"use client";
import {SessionProvider} from "next-auth/react"
import {GlobalProvider} from "@/app/contexts/UserContext";
import {ThirdwebProvider} from "thirdweb/react";

require('dotenv').config();
export default function Providers({children, session}) {
    return (

        <SessionProvider session={session}>
            <GlobalProvider>
                <ThirdwebProvider>

                    {children}
                </ThirdwebProvider>

            </GlobalProvider>
        </SessionProvider>
    )
}