import React from 'react';
import Image from "next/image";
import Link from "next/link";

function BrandLogo(props) {
    return (
        <Link href="/" className="flex gap-2 flex-row items-center justify-center px-3 py-1">
            <Image
                src="/img/clickpaid_logo.png"
                alt="logo"
                width={50}
                height={50}
                className="w-auto h-10 rounded-xl overflow-clip"
            />
            <div
                className=" text-theme-blue-dark text-2xl"
            style={{fontWeight:900}}
            >ClickPaid
            </div>
        </Link>

    );
}

export default BrandLogo;