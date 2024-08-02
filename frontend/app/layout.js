import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "ClickPaid",
    description: "Vote for thumbnails, get paid !",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={inter.className}>
        <Head>
            <title>{metadata.title}</title>
            <meta name="description" content={metadata.description} />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <body className="bg-theme-gray-dark text-white">
        <Navbar />
        {children}
        </body>
        </html>
    );
}