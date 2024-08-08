import "./globals.css";
import Navbar from "@/components/Navbar";
import {Toaster} from "react-hot-toast";
import React from "react";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

export const metadata = {
    title: 'ClickPaid',
    description: 'Create, vote, earn',
    charSet: 'UTF-8',
    icons: {
        icon: '/favicon.ico',
    },
}

export const viewport = {
    width: 'device-width',
    initialScale: 1.0,
}

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body className="pt-24">
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