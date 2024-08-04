import "./globals.css";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import React from "react";
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {

    return (
        <html lang="en">
        <Head>
            <title>ClickPaid</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <body className=" pt-20">
        <Navbar />
        <Toaster position="top-center" reverseOrder={true} />
        {children}
        <Footer />
        </body>
        </html>
    );
}