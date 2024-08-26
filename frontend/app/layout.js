import "./globals.css";
import Navbar from "@/components/Navbar";
import {Toaster} from "react-hot-toast";
import React from "react";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import Head from "next/head";

export const metadata = {
    title: 'ClickPaid', description: 'Create, vote, earn', charSet: 'UTF-8', icons: {
        icon: '/favicon.ico',
    },
}

export const viewport = {
    width: 'device-width', initialScale: 1.0,
}

export default function RootLayout({children}) {
    return (<html lang="en">
    <Head>
        <meta property="dscvr:canvas:version" content="vNext"/>
    </Head>
        <body className="pt-24">
        <Providers>
            <Navbar/>
            <Toaster toastOptions={{
                style: {
                    background: '#333', color: '#fff',
                },
            }}
                     position="bottom-left" reverseOrder={true}/>
            {children}
            <Footer/>
        </Providers>
        </body>
        </html>);
}