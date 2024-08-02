import React from 'react';
import Image from "next/image";
import Link from "next/link";

function BrandLogo(props) {
    return (
        <Link href="/" className="flex gap-1 flex-row items-center justify-center">
            <Image
                src="/img/clickpaid_logo.png"
                alt="logo"
                width={200}
                height={50}
                className="w-auto h-14"
            />
            <div
                className="font-extrabold bg-clip-text text-transparent bg-gradient-to-l from-theme-pink to-theme-purple text-3xl">ClickPaid
            </div>
        </Link>

    );
}

export default BrandLogo;