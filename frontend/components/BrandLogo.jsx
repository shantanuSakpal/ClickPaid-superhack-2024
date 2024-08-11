import React from 'react';
import Image from "next/image";
import Link from "next/link";

function BrandLogo(props) {
    return (
        <Link href="/" className="flex gap-1 flex-row items-center justify-center px-3 py-1">
            <Image
                src="/img/clickpaid_logo.png"
                alt="logo"
                width={200}
                height={50}
                className="w-auto h-12 rounded-xl overflow-clip"
            />
            <div
                className="font-extrabold text-theme-blue-dark text-3xl">ClickPaid
            </div>
        </Link>

    );
}

export default BrandLogo;