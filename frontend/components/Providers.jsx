"use client";
import { SessionProvider } from "next-auth/react"
import { ThirdwebProvider } from "thirdweb/react";
require('dotenv').config();
export default function Providers({ children, session }) {
    return (

        <SessionProvider session={session}>
            <ThirdwebProvider
                clientId={process.env.NEXT_THIRD_WEB_ID}
                secretKey={process.env.NEXT_THIRD_WEB_SECRET} >
                {children}
            </ThirdwebProvider>
        </SessionProvider>
    )
}