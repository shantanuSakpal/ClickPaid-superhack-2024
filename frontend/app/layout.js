import "./globals.css";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import {Toaster} from "react-hot-toast";
import React from "react";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

export const metadata = {
    title: 'ClickPaid',
    description: 'Create, vote, earn',
}
export default function RootLayout({children}) {

    return (
        <html lang="en">
        <Head>
            <meta charSet="UTF-8"/>
            <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <meta name="description" content={metadata.description}/>
            <title>{metadata.title}</title>
            <link rel="icon" href="/favicon.ico"/>
        </Head>
        <body className=" pt-20">
        <Providers>
            <Navbar/>
            <Toaster position="top-center" reverseOrder={true}/>
            {children}
            <Footer/>
        </Providers>
        </body>
        </html>
    );
}